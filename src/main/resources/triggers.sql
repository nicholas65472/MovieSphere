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
    v_scor_pozitiv
INTEGER := 0;
    v_scor_negativ
INTEGER := 0;
    cuvinte_pozitive
TEXT[] := ARRAY[
        'excelent', 'superb', 'minunat', 'fantastic', 'extraordinar',
        'placut', 'bun', 'frumos', 'recomandat', 'genial', 'captivant',
        'impresionant', 'magistral', 'senzational', 'uimitor', 'perfect',
        'excellent', 'great', 'amazing', 'wonderful', 'brilliant', 'love',
        'best', 'awesome', 'outstanding', 'masterpiece'
    ];
    cuvinte_negative
TEXT[] := ARRAY[
        'plictisitor', 'slab', 'dezamagitor', 'oribil', 'rau',
        'banal', 'mediocru', 'enervant', 'groaznic', 'teribil', 'urat',
        'boring', 'bad', 'terrible', 'awful', 'worst', 'hate', 'poor',
        'disappointing', 'weak', 'horrible', 'waste', 'dreadful'
    ];
    cuvant
TEXT;
BEGIN
    v_text := LOWER(COALESCE(NEW.continut, ''));

    FOREACH
cuvant IN ARRAY cuvinte_pozitive LOOP
        IF v_text LIKE '%' || cuvant || '%' THEN
            v_scor_pozitiv := v_scor_pozitiv + 1;
    END IF;
END LOOP;

    FOREACH
cuvant IN ARRAY cuvinte_negative LOOP
        IF v_text LIKE '%' || cuvant || '%' THEN
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