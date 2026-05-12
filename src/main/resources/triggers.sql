-- Trigger 1: Validare versiune vizualizare
-- Verifica daca versiunea selectata apartine filmului vizualizat
DROP TRIGGER IF EXISTS trg_valideazaVersiuneVizualizare ON vizualizari @@

CREATE OR REPLACE FUNCTION valideazaVersiuneVizualizare()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_versiune IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM versiuni_film
        WHERE id = NEW.id_versiune
          AND id_film = NEW.id_film
    ) THEN
        RAISE EXCEPTION 'VERSIUNE_INVALIDA: Versiunea % nu apartine filmului %.',
            NEW.id_versiune, NEW.id_film
            USING ERRCODE = 'P0008';
    END IF;

RETURN NEW;
END;
$$
LANGUAGE plpgsql @@

CREATE TRIGGER trg_valideazaVersiuneVizualizare
    BEFORE INSERT OR
UPDATE OF id_film, id_versiune
ON vizualizari
    FOR EACH ROW
    EXECUTE FUNCTION valideazaVersiuneVizualizare() @@


-- Trigger 2: Recalculare rating film
-- Activat la INSERT, UPDATE vot/id_film si DELETE pe vizualizari
    DROP TRIGGER IF EXISTS trg_recalculeazaRating ON vizualizari @@

    CREATE OR REPLACE FUNCTION recalculeazaRating()
    RETURNS TRIGGER AS $$
DECLARE
v_id_film INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_id_film := OLD.id_film;
    ELSE
        v_id_film := NEW.id_film;
    END IF;

UPDATE filme
SET rating = COALESCE((SELECT ROUND(AVG(vot)::NUMERIC, 2)
         FROM vizualizari
         WHERE id_film = v_id_film
         AND vot IS NOT NULL), 0.00),
    numar_voturi = (SELECT COUNT(*)
          FROM vizualizari
          WHERE id_film = v_id_film
          AND vot IS NOT NULL)
WHERE id = v_id_film;

    IF TG_OP = 'UPDATE' AND OLD.id_film <> NEW.id_film THEN
UPDATE filme
SET rating = COALESCE((SELECT ROUND(AVG(vot)::NUMERIC, 2)
            FROM vizualizari
            WHERE id_film = OLD.id_film
            AND vot IS NOT NULL), 0.00),
    numar_voturi = (SELECT COUNT(*)
            FROM vizualizari
            WHERE id_film = OLD.id_film
            AND vot IS NOT NULL)
WHERE id = OLD.id_film;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

RETURN NEW;
END;
$$
LANGUAGE plpgsql @@

CREATE TRIGGER trg_recalculeazaRating
    AFTER INSERT OR
UPDATE OF vot, id_film OR
DELETE
ON vizualizari
    FOR EACH ROW
    EXECUTE FUNCTION recalculeazaRating() @@

-- Trigger 3: Analiza automata sentiment comentariu
-- Activat BEFORE INSERT sau UPDATE pe comentarii_filme
    DROP TRIGGER IF EXISTS trg_analizaSentiment ON comentarii_filme @@

    CREATE OR REPLACE FUNCTION analizaSentiment()
    RETURNS TRIGGER AS $$
DECLARE
v_text TEXT;
    v_text_normalizat TEXT;
    v_scor_pozitiv
INTEGER := 0;
    v_scor_negativ
INTEGER := 0;
    cuvinte_pozitive
TEXT[] := ARRAY[
        'excelent', 'superb', 'superba', 'superbe', 'superbi', 'minunat', 'minunata',
        'fantastic', 'extraordinar', 'extraordinara', 'placut', 'placuta', 'bun',
        'buna', 'bune', 'frumos', 'frumoasa', 'recomand', 'recomandat', 'genial',
        'captivant', 'impresionant', 'magistral', 'senzational', 'uimitor', 'perfect',
        'perfecta', 'emotionant', 'emotionanta', 'excelent', 'tare', 'reusit',
        'reusita', 'excellent', 'great', 'amazing', 'wonderful', 'brilliant', 'love',
        'loved', 'best', 'awesome', 'outstanding', 'masterpiece', 'good', 'beautiful'
    ];
    cuvinte_negative
TEXT[] := ARRAY[
        'plictisitor', 'plictisitoare', 'slab', 'slaba', 'dezamagitor', 'dezamagitoare',
        'oribil', 'oribila', 'rau', 'rea', 'prost', 'proasta', 'banal', 'banala',
        'mediocru', 'mediocra', 'enervant', 'groaznic', 'groaznica', 'teribil',
        'teribila', 'urat', 'urata', 'plictiseala', 'dezamagit', 'dezamagita',
        'nasol', 'naspa', 'confuz', 'confuza', 'boring', 'bad', 'terrible', 'awful',
        'worst', 'hate', 'hated', 'poor', 'disappointing', 'weak', 'horrible',
        'waste', 'dreadful'
    ];
    expresii_negative
TEXT[] := ARRAY[
        'nu mi a placut', 'nu mi placut', 'nu mi-a placut', 'nu imi place',
        'nu mi place', 'nu mi a placut deloc', 'nu recomand', 'nu l recomand',
        'nu este bun', 'nu e bun', 'nu este buna', 'nu e buna', 'nu a fost bun',
        'nu a fost buna', 'nu este frumos', 'nu e frumos', 'nu este superb',
        'nu e superb', 'nu este reusit', 'nu e reusit', 'nu mi a placut filmul',
        'mi a displacut', 'mi-a displacut', 'nu as recomanda', 'n as recomanda',
        'not good', 'not great', 'not amazing', 'did not like', 'didnt like',
        'do not recommend', 'dont recommend'
    ];
    cuvant
TEXT;
BEGIN
    v_text := LOWER(COALESCE(NEW.continut, ''));
    v_text_normalizat := LOWER(TRANSLATE(v_text, 'ăâîșşțţĂÂÎȘŞȚŢ', 'aaissttAAISSTT'));
    v_text_normalizat := REPLACE(v_text_normalizat, '-', ' ');
    v_text_normalizat := REGEXP_REPLACE(v_text_normalizat, '[^a-z0-9]+', ' ', 'g');
    v_text_normalizat := ' ' || TRIM(v_text_normalizat) || ' ';

    FOREACH
cuvant IN ARRAY expresii_negative LOOP
        IF v_text_normalizat LIKE '% ' || REPLACE(cuvant, '-', ' ') || ' %' THEN
            v_scor_negativ := v_scor_negativ + 3;
        END IF;
    END LOOP;

    FOREACH
cuvant IN ARRAY cuvinte_pozitive LOOP
        IF v_text_normalizat LIKE '% nu %' || cuvant || ' %'
           OR v_text_normalizat LIKE '% n %' || cuvant || ' %'
           OR v_text_normalizat LIKE '% fara %' || cuvant || ' %'
           OR v_text_normalizat LIKE '% deloc %' || cuvant || ' %' THEN
            v_scor_negativ := v_scor_negativ + 2;
        ELSIF v_text_normalizat LIKE '% ' || cuvant || ' %' THEN
            v_scor_pozitiv := v_scor_pozitiv + 1;
    END IF;
END LOOP;

    FOREACH
cuvant IN ARRAY cuvinte_negative LOOP
        IF v_text_normalizat LIKE '% ' || cuvant || ' %' THEN
            v_scor_negativ := v_scor_negativ + 1;
END IF;
END LOOP;

    IF v_scor_pozitiv > v_scor_negativ THEN
        NEW.sentiment := 'pozitiv';
    ELSIF v_scor_negativ > v_scor_pozitiv THEN
        NEW.sentiment := 'negativ';
    ELSE
        NEW.sentiment := 'neutru';
    END IF;

RETURN NEW;
END;
$$
LANGUAGE plpgsql @@

CREATE TRIGGER trg_analizaSentiment
    BEFORE INSERT OR
UPDATE OF continut
ON comentarii_filme
    FOR EACH ROW
    EXECUTE FUNCTION analizaSentiment() @@


-- Trigger 4: Validare comentariu actor
-- Verifica daca actorul comentat face parte din distributia filmului
    DROP TRIGGER IF EXISTS trg_valideazaComentariuActor ON comentarii_actori @@

    CREATE OR REPLACE FUNCTION valideazaComentariuActor()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_film IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM distributie
        WHERE id_film = NEW.id_film
          AND id_actor = NEW.id_actor
    ) THEN
        RAISE EXCEPTION 'ACTOR_FILM_INVALID: Actorul % nu face parte din distributia filmului %.',
            NEW.id_actor, NEW.id_film
            USING ERRCODE = 'P0010';
    END IF;

RETURN NEW;
END;
$$
LANGUAGE plpgsql @@

CREATE TRIGGER trg_valideazaComentariuActor
    BEFORE INSERT OR
UPDATE OF id_actor, id_film
ON comentarii_actori
    FOR EACH ROW
    EXECUTE FUNCTION valideazaComentariuActor() @@


-- Trigger 5: Audit log pentru operatii pe clienti
-- Inregistreaza INSERT, UPDATE, DELETE in audit_log
    DROP TRIGGER IF EXISTS trg_auditClienti ON clienti @@

    CREATE OR REPLACE FUNCTION auditClienti()
    RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(tabel_nume, operatie, id_rand, detalii)
        VALUES (
            'clienti',
            'INSERT',
            NEW.id,
            'Client nou: ' || NEW.prenume || ' ' || NEW.nume || ' (' || NEW.email || ')'
        );

RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(tabel_nume, operatie, id_rand, detalii)
        VALUES (
            'clienti',
            'UPDATE',
            NEW.id,
            'Client modificat: ' || NEW.email
        );

RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(tabel_nume, operatie, id_rand, detalii)
        VALUES (
            'clienti',
            'DELETE',
            OLD.id,
            'Client sters: ' || OLD.email
        );

RETURN OLD;
    END IF;

RETURN NULL;
END;
$$
LANGUAGE plpgsql @@

CREATE TRIGGER trg_auditClienti
    AFTER INSERT OR
UPDATE OR
DELETE
ON clienti
    FOR EACH ROW
    EXECUTE FUNCTION auditClienti() @@
