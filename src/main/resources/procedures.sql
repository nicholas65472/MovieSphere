-- FUNCTIE: Inregistrare client nou
-- Exceptie: email deja existent
CREATE OR REPLACE FUNCTION fn_inregistrare_client(
    p_nume          VARCHAR,
    p_prenume       VARCHAR,
    p_email         VARCHAR,
    p_parola_hash   VARCHAR,
    p_telefon       VARCHAR DEFAULT NULL,
    p_oras          VARCHAR DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
v_id_client INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM clienti WHERE email = p_email) THEN
        RAISE EXCEPTION 'EMAIL_EXISTENT: Adresa de email % este deja inregistrata.', p_email
            USING ERRCODE = 'P0001';
END IF;

INSERT INTO clienti(nume, prenume, email, parola_hash, telefon, oras)
VALUES (p_nume, p_prenume, p_email, p_parola_hash, p_telefon, p_oras)
    RETURNING id INTO v_id_client;

RETURN v_id_client;
END;
$$ LANGUAGE plpgsql @@

-- FUNCTIE: Adaugare vizualizare
-- Exceptie: clientul sau filmul nu exista, sau nu exista versiunea
CREATE OR REPLACE FUNCTION fn_adauga_vizualizare(
    p_id_client     INTEGER,
    p_id_film       INTEGER,
    p_id_versiune   INTEGER DEFAULT NULL,
    p_vot           INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
v_id INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clienti WHERE id = p_id_client AND activ = TRUE) THEN
        RAISE EXCEPTION 'CLIENT_INEXISTENT: Clientul cu id % nu exista sau este inactiv.', p_id_client
            USING ERRCODE = 'P0002';
END IF;

    IF NOT EXISTS (SELECT 1 FROM filme WHERE id = p_id_film AND activ = TRUE) THEN
        RAISE EXCEPTION 'FILM_INEXISTENT: Filmul cu id % nu exista sau nu este activ.', p_id_film
            USING ERRCODE = 'P0003';
END IF;

    IF p_vot IS NOT NULL AND (p_vot < 1 OR p_vot > 10) THEN
        RAISE EXCEPTION 'VOT_INVALID: Votul trebuie sa fie intre 1 si 10. Vot primit: %', p_vot
            USING ERRCODE = 'P0004';
END IF;

INSERT INTO vizualizari(id_client, id_film, id_versiune, vot)
VALUES (p_id_client, p_id_film, p_id_versiune, p_vot)
    RETURNING id INTO v_id;

RETURN v_id;
END;
$$ LANGUAGE plpgsql @@

-- FUNCTIE: Adaugare comentariu film
-- Exceptie: clientul nu a vizualizat filmul
CREATE OR REPLACE FUNCTION fn_adauga_comentariu(
    p_id_client INTEGER,
    p_id_film   INTEGER,
    p_continut  TEXT
)
RETURNS INTEGER AS $$
DECLARE
v_id INTEGER;
BEGIN
    IF NOT EXISTS ( SELECT 1 FROM vizualizari WHERE id_client = p_id_client AND id_film = p_id_film) THEN
        RAISE EXCEPTION 'VIZUALIZARE_LIPSA: Clientul % nu a vizualizat filmul % si nu poate lasa comentariu.', p_id_client, p_id_film
            USING ERRCODE = 'P0005';
END IF;

INSERT INTO comentarii_filme(id_client, id_film, continut)
VALUES (p_id_client, p_id_film, p_continut)
    ON CONFLICT (id_client, id_film)
    DO UPDATE SET continut = EXCLUDED.continut,
               data_comentariu = CURRENT_TIMESTAMP
               RETURNING id INTO v_id;

RETURN v_id;
END;
$$ LANGUAGE plpgsql @@

-- PROCEDURA: Actualizare vot
CREATE OR REPLACE PROCEDURE pr_actualizeaza_vot(
    p_id_client INTEGER,
    p_id_film   INTEGER,
    p_vot       INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_vot < 1 OR p_vot > 10 THEN
        RAISE EXCEPTION 'VOT_INVALID: Votul trebuie sa fie intre 1 si 10.'
            USING ERRCODE = 'P0004';
END IF;

UPDATE vizualizari
SET vot = p_vot WHERE id_client = p_id_client AND id_film = p_id_film AND id = (
    SELECT id FROM vizualizari WHERE id_client = p_id_client AND id_film = p_id_film
    ORDER BY data_vizualizare DESC LIMIT 1
);

IF NOT FOUND THEN
    RAISE EXCEPTION 'VIZUALIZARE_LIPSA: Nu exista o vizualizare pentru clientul % si filmul %.',
            p_id_client, p_id_film
            USING ERRCODE = 'P0005';
    END IF;
END;
$$ @@


-- FUNCTIE: Profil cinematic client
-- Returneaza preferintele dominante ale unui client
CREATE OR REPLACE FUNCTION fn_profil_client(p_id_client INTEGER)
RETURNS TABLE (
    categorie           VARCHAR,
    numar_vizualizari   BIGINT,
    rating_mediu        NUMERIC,
    procent             NUMERIC
) AS $$
BEGIN
RETURN QUERY WITH total AS ( SELECT COUNT(*) AS total_viz FROM vizualizari v
        WHERE v.id_client = p_id_client
    )
SELECT c.nume::VARCHAR, COUNT(v.id) AS numar_vizualizari, ROUND(AVG(v.vot)::NUMERIC, 2) AS rating_mediu,
    ROUND((COUNT(v.id)::NUMERIC / NULLIF(t.total_viz, 0) * 100), 1) AS procent
FROM vizualizari v JOIN filme f ON v.id_film = f.id JOIN categorii c ON f.id_categorie = c.id CROSS JOIN total t
    WHERE v.id_client = p_id_client GROUP BY c.nume, t.total_viz ORDER BY numar_vizualizari DESC;
END;
$$ LANGUAGE plpgsql @@

-- Algoritm de recomandari
-- Calculeaza un scor de compatibilitate pentru fiecare film nevizualizat de client, bazat pe:
--   40% - compatibilitate categorie (din profilul clientului)
--   30% - rating-ul filmului
--   20% - popularitate (numar vizualizari globale)
--   10% - actori preferati (actori din filme votate bine de client)
CREATE OR REPLACE FUNCTION fn_genereaza_recomandari(
    p_id_client     INTEGER,
    p_numar_max     INTEGER DEFAULT 10
)
RETURNS TABLE (
    id_film         INTEGER,
    titlu           VARCHAR,
    categorie       VARCHAR,
    rating          NUMERIC,
    scor_final      NUMERIC,
    motiv           TEXT
) AS $$

DECLARE
v_total_viz INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clienti WHERE id = p_id_client) THEN
        RAISE EXCEPTION 'CLIENT_INEXISTENT: Clientul cu id % nu exista.', p_id_client
            USING ERRCODE = 'P0002';
END IF;

SELECT COUNT(*) INTO v_total_viz FROM vizualizari WHERE id_client = p_id_client;

DELETE FROM recomandari WHERE id_client = p_id_client;

WITH
    profil_categorii AS (SELECT f.id_categorie, COUNT(*)::NUMERIC / NULLIF(v_total_viz, 0) AS pondere
        FROM vizualizari v JOIN filme f ON v.id_film = f.id WHERE v.id_client = p_id_client
        GROUP BY f.id_categorie
    ),
    actori_preferati AS ( SELECT DISTINCT d.id_actor FROM vizualizari v JOIN distributie d ON v.id_film = d.id_film
        WHERE v.id_client = p_id_client AND v.vot >= 7
    ),

    max_viz AS (SELECT GREATEST(MAX(cnt), 1) AS max_cnt FROM ( SELECT COUNT(*) AS cnt
                 FROM vizualizari GROUP BY id_film) t
    ),

    scoruri AS (
        SELECT f.id AS film_id, f.titlu, cat.nume AS categorie_nume, f.rating,
            COALESCE(pc.pondere, 0) * 40 AS scor_categorie,
            (f.rating / 10.0) * 30 AS scor_rating,
            (COUNT(vg.id)::NUMERIC / mv.max_cnt) * 20 AS scor_popularitate,
            CASE
                WHEN EXISTS (
                    SELECT 1 FROM distributie d2 JOIN actori_preferati ap ON d2.id_actor = ap.id_actor
                    WHERE d2.id_film = f.id) THEN 10
                ELSE 0
                END AS scor_actori
        FROM filme f JOIN categorii cat ON f.id_categorie = cat.id
                 LEFT JOIN profil_categorii pc ON f.id_categorie = pc.id_categorie
                 LEFT JOIN vizualizari vg ON f.id = vg.id_film CROSS JOIN max_viz mv
        WHERE f.activ = TRUE AND NOT EXISTS (
            SELECT 1 FROM vizualizari v2 WHERE v2.id_film = f.id AND v2.id_client = p_id_client)
        GROUP BY f.id, f.titlu, cat.nume, f.rating, pc.pondere, mv.max_cnt
    )
INSERT INTO recomandari(id_client, id_film, scor, motiv)
SELECT p_id_client, s.film_id, ROUND(s.scor_categorie + s.scor_rating + s.scor_popularitate + s.scor_actori, 2),
    'Categorie: ' || ROUND(s.scor_categorie, 1) ||
    '/40 | Rating: ' || ROUND(s.scor_rating, 1) ||
    '/30 | Popularitate: ' || ROUND(s.scor_popularitate, 1) ||
    '/20 | Actori: ' || s.scor_actori || '/10'
FROM scoruri s
ORDER BY (s.scor_categorie + s.scor_rating + s.scor_popularitate + s.scor_actori) DESC LIMIT p_numar_max;

RETURN QUERY
SELECT r.id_film, f.titlu, c.nume::VARCHAR, f.rating, r.scor, r.motiv FROM recomandari r
    JOIN filme f ON r.id_film = f.id JOIN categorii c ON f.id_categorie = c.id
        WHERE r.id_client = p_id_client ORDER BY r.scor DESC;
END;
$$ LANGUAGE plpgsql @@

-- FUNCTIE: Top filme dupa rating si voturi
CREATE OR REPLACE FUNCTION fn_top_filme(
    p_id_categorie  INTEGER DEFAULT NULL,
    p_numar         INTEGER DEFAULT 10
)
RETURNS TABLE (
    id_film         INTEGER,
    titlu           VARCHAR,
    categorie       VARCHAR,
    rating          NUMERIC,
    numar_voturi    INTEGER,
    numar_vizualizari BIGINT
) AS $$

BEGIN
RETURN QUERY
SELECT f.id, f.titlu, c.nume::VARCHAR, f.rating, f.numar_voturi, COUNT(v.id) AS numar_vizualizari
    FROM filme f JOIN categorii c ON f.id_categorie = c.id LEFT JOIN vizualizari v ON f.id = v.id_film
        WHERE f.activ = TRUE AND (p_id_categorie IS NULL OR f.id_categorie = p_id_categorie)
            GROUP BY f.id, f.titlu, c.nume, f.rating, f.numar_voturi
                ORDER BY f.rating DESC, f.numar_voturi DESC
    LIMIT p_numar;
END;
$$ LANGUAGE plpgsql @@


-- FUNCTIE: Istoric complet client
CREATE OR REPLACE FUNCTION fn_istoric_client(p_id_client INTEGER)
RETURNS TABLE (
    id_film             INTEGER,
    titlu               VARCHAR,
    categorie           VARCHAR,
    data_vizualizare    TIMESTAMP,
    vot                 INTEGER,
    comentariu          TEXT,
    sentiment           VARCHAR
) AS $$
BEGIN

RETURN QUERY
SELECT f.id, f.titlu, c.nume::VARCHAR, v.data_vizualizare, v.vot, cf.continut, cf.sentiment
    FROM vizualizari v JOIN filme f ON v.id_film = f.id JOIN categorii c ON f.id_categorie = c.id
         LEFT JOIN comentarii_filme cf ON cf.id_client = p_id_client AND cf.id_film = f.id
            WHERE v.id_client = p_id_client ORDER BY v.data_vizualizare DESC;
END;
$$ LANGUAGE plpgsql @@

-- FUNCTIE: Statistici filme pe perioade sezoniere
CREATE OR REPLACE FUNCTION fn_statistici_sezoniere(p_id_film INTEGER DEFAULT NULL)
RETURNS TABLE (
    sezon               VARCHAR,
    numar_vizualizari   BIGINT,
    rating_mediu        NUMERIC,
    titlu_film          VARCHAR
) AS $$
BEGIN

RETURN QUERY
SELECT
    CASE
        WHEN EXTRACT(MONTH FROM v.data_vizualizare) IN (12, 1, 2) THEN 'Iarna'
        WHEN EXTRACT(MONTH FROM v.data_vizualizare) IN (3, 4, 5)  THEN 'Primavara'
        WHEN EXTRACT(MONTH FROM v.data_vizualizare) IN (6, 7, 8)  THEN 'Vara'
        ELSE 'Toamna'
        END AS sezon,
    COUNT(v.id) AS numar_vizualizari, ROUND(AVG(v.vot)::NUMERIC, 2) AS rating_mediu,
    f.titlu::VARCHAR FROM vizualizari v JOIN filme f ON v.id_film = f.id
        WHERE (p_id_film IS NULL OR v.id_film = p_id_film) GROUP BY sezon, f.titlu
            ORDER BY numar_vizualizari DESC;
END;
$$ LANGUAGE plpgsql @@

-- FUNCTIE: Autentificare client
CREATE OR REPLACE FUNCTION fn_autentificare(
    p_email         VARCHAR,
    p_parola_hash   VARCHAR
)
RETURNS TABLE (
    id          INTEGER,
    nume        VARCHAR,
    prenume     VARCHAR,
    email       VARCHAR,
    oras        VARCHAR
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clienti WHERE email = p_email) THEN
        RAISE EXCEPTION 'EMAIL_INEXISTENT: Nu exista un cont pentru adresa %', p_email
            USING ERRCODE = 'P0006';
END IF;

RETURN QUERY
SELECT c.id, c.nume, c.prenume, c.email, c.oras FROM clienti c WHERE c.email = p_email
    AND c.parola_hash = p_parola_hash AND c.activ = TRUE;

IF NOT FOUND THEN
        RAISE EXCEPTION 'PAROLA_INCORECTA: Parola introdusa este incorecta.'
            USING ERRCODE = 'P0007';
END IF;
END;
$$ LANGUAGE plpgsql @@