-- Functie: adauga un client nou si verifica daca emailul exista deja
CREATE
OR REPLACE FUNCTION fn_inregistrare_client(
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
VALUES (p_nume, p_prenume, p_email, p_parola_hash, p_telefon, p_oras) RETURNING id
INTO v_id_client;

RETURN v_id_client;
END;
$$
LANGUAGE plpgsql @@


-- Functie: adauga o vizualizare pentru un client si valideaza filmul, versiunea si votul
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

    IF p_id_versiune IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM versiuni_film
            WHERE id = p_id_versiune
              AND id_film = p_id_film
        ) THEN
            RAISE EXCEPTION 'VERSIUNE_INVALIDA: Versiunea cu id % nu exista sau nu apartine filmului %.', p_id_versiune, p_id_film
                USING ERRCODE = 'P0008';
        END IF;
    END IF;

    IF p_vot IS NOT NULL AND (p_vot < 1 OR p_vot > 10) THEN
        RAISE EXCEPTION 'VOT_INVALID: Votul trebuie sa fie intre 1 si 10. Vot primit: %', p_vot
            USING ERRCODE = 'P0004';
    END IF;

INSERT INTO vizualizari(id_client, id_film, id_versiune, vot)
VALUES (p_id_client, p_id_film, p_id_versiune, p_vot) RETURNING id
INTO v_id;

RETURN v_id;
END;
$$
LANGUAGE plpgsql @@


-- Functie: adauga sau actualizeaza comentariul unui client pentru un film
CREATE OR REPLACE FUNCTION fn_adauga_comentariu(
    p_id_client INTEGER,
    p_id_film   INTEGER,
    p_continut  TEXT
)
RETURNS INTEGER AS $$
DECLARE
v_id INTEGER;
v_client TEXT;
v_film TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM vizualizari
        WHERE id_client = p_id_client
          AND id_film = p_id_film
    ) THEN
        SELECT COALESCE(prenume || ' ' || nume, 'Clientul ' || p_id_client::TEXT)
        INTO v_client
        FROM clienti
        WHERE id = p_id_client;

        SELECT COALESCE(titlu, 'filmul ' || p_id_film::TEXT)
        INTO v_film
        FROM filme
        WHERE id = p_id_film;

        RAISE EXCEPTION 'VIZUALIZARE_LIPSA: % nu a vizualizat filmul "%", deci nu poate lasa comentariu.', COALESCE(v_client, 'Clientul ' || p_id_client::TEXT), COALESCE(v_film, p_id_film::TEXT)
            USING ERRCODE = 'P0005';
    END IF;

INSERT INTO comentarii_filme(id_client, id_film, continut)
VALUES (p_id_client, p_id_film, p_continut) ON CONFLICT (id_client, id_film)
    DO
UPDATE SET
    continut = EXCLUDED.continut,
    data_comentariu = CURRENT_TIMESTAMP
    RETURNING id
INTO v_id;

RETURN v_id;
END;
$$
LANGUAGE plpgsql @@


-- Procedura: actualizeaza votul pentru ultima vizualizare a unui client la un film
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
SET vot = p_vot
WHERE id_client = p_id_client
  AND id_film = p_id_film
  AND id = (SELECT id
            FROM vizualizari
            WHERE id_client = p_id_client
              AND id_film = p_id_film
            ORDER BY data_vizualizare DESC
    LIMIT 1
    );

IF NOT FOUND THEN
        RAISE EXCEPTION 'VIZUALIZARE_LIPSA: Nu exista o vizualizare pentru clientul % si filmul %.',
            p_id_client, p_id_film
            USING ERRCODE = 'P0005';
    END IF;
END;
$$
@@


-- Functie: calculeaza profilul unui client pe categorii vizualizate
CREATE OR REPLACE FUNCTION fn_profil_client(p_id_client INTEGER)
RETURNS TABLE (
    categorie           VARCHAR,
    numar_vizualizari   BIGINT,
    rating_mediu        NUMERIC,
    procent             NUMERIC
) AS $$
BEGIN
RETURN QUERY WITH total AS (
        SELECT COUNT(*) AS total_viz
        FROM vizualizari v
        WHERE v.id_client = p_id_client
    )
SELECT c.nume::VARCHAR, COUNT(v.id) AS numar_vizualizari,
       ROUND(AVG(v.vot)::NUMERIC, 2)                                   AS rating_mediu,
       ROUND((COUNT(v.id)::NUMERIC / NULLIF(t.total_viz, 0) * 100), 1) AS procent
FROM vizualizari v
         JOIN filme f ON v.id_film = f.id
         JOIN categorii c ON f.id_categorie = c.id
         CROSS JOIN total t
WHERE v.id_client = p_id_client
GROUP BY c.nume, t.total_viz
ORDER BY numar_vizualizari DESC;
END;
$$
LANGUAGE plpgsql @@


-- Functie: returneaza actorii cel mai des intalniti in filmele vizionate de un client
CREATE OR REPLACE FUNCTION fn_actori_frecventi(
    p_id_client INTEGER,
    p_numar_max INTEGER DEFAULT 10
)
RETURNS TABLE (
    id_actor          INTEGER,
    nume_scena        VARCHAR,
    nationalitate     VARCHAR,
    numar_aparitii    BIGINT,
    rating_mediu      NUMERIC,
    tip_rol_frecvent  VARCHAR
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clienti WHERE id = p_id_client) THEN
        RAISE EXCEPTION 'CLIENT_INEXISTENT: Clientul cu id % nu exista.', p_id_client
            USING ERRCODE = 'P0002';
    END IF;

RETURN QUERY
SELECT a.id,
       a.nume_scena::VARCHAR, a.nationalitate::VARCHAR, COUNT(v.id) AS numar_aparitii,
       ROUND(AVG(v.vot)::NUMERIC, 2) AS rating_mediu,
       (SELECT d2.tip_rol
        FROM distributie d2
                 JOIN vizualizari v2 ON d2.id_film = v2.id_film
        WHERE d2.id_actor = a.id
          AND v2.id_client = p_id_client
        GROUP BY d2.tip_rol
        ORDER BY COUNT(*) DESC
        LIMIT 1 )::VARCHAR AS tip_rol_frecvent
FROM vizualizari v
    JOIN distributie d
ON v.id_film = d.id_film
    JOIN actori a ON d.id_actor = a.id
WHERE v.id_client = p_id_client
GROUP BY a.id, a.nume_scena, a.nationalitate
ORDER BY numar_aparitii DESC, rating_mediu DESC NULLS LAST
    LIMIT p_numar_max;
END;
$$
LANGUAGE plpgsql @@


-- Functie: gaseste clienti cu preferinte asemanatoare
-- Determina similaritatea pe baza:
--   40% - categorii comune vizualizate
--   30% - rating-uri acordate similar (diferenta medie mica)
--   20% - actori comuni urmariti
--   10% - sentimente similare in comentarii
CREATE OR REPLACE FUNCTION fn_clienti_similari(
    p_id_client INTEGER,
    p_numar_max INTEGER DEFAULT 5
)
RETURNS TABLE (
    id_client_similar   INTEGER,
    nume_complet        VARCHAR,
    oras                VARCHAR,
    scor_similaritate   NUMERIC,
    categorii_comune    BIGINT,
    actori_comuni       BIGINT,
    motiv               TEXT
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clienti WHERE id = p_id_client) THEN
        RAISE EXCEPTION 'CLIENT_INEXISTENT: Clientul cu id % nu exista.', p_id_client
            USING ERRCODE = 'P0002';
    END IF;

RETURN QUERY WITH
    cat_sursa AS (
        SELECT DISTINCT f.id_categorie
        FROM vizualizari v
        JOIN filme f ON v.id_film = f.id
        WHERE v.id_client = p_id_client
    ),
    rating_sursa AS (
        SELECT f.id_categorie, AVG(v.vot) AS avg_vot
        FROM vizualizari v
        JOIN filme f ON v.id_film = f.id
        WHERE v.id_client = p_id_client
          AND v.vot IS NOT NULL
        GROUP BY f.id_categorie
    ),
    actori_sursa AS (
        SELECT DISTINCT d.id_actor
        FROM vizualizari v
        JOIN distributie d ON v.id_film = d.id_film
        WHERE v.id_client = p_id_client
          AND COALESCE(v.vot, 0) >= 7
    ),
    sentiment_sursa AS (
        SELECT sentiment, COUNT(*) AS cnt
        FROM comentarii_filme
        WHERE id_client = p_id_client
          AND sentiment IS NOT NULL
        GROUP BY sentiment
        ORDER BY cnt DESC
        LIMIT 1
    ),
    scoruri AS (
        SELECT
            c.id AS cid,
            (c.prenume || ' ' || c.nume)::VARCHAR AS nume_c,
            c.oras::VARCHAR AS oras_c,

            (
                SELECT COUNT(*)
                FROM (
                    SELECT DISTINCT f2.id_categorie
                    FROM vizualizari v2
                    JOIN filme f2 ON v2.id_film = f2.id
                    WHERE v2.id_client = c.id
                ) cat_alt
                WHERE cat_alt.id_categorie IN (SELECT id_categorie FROM cat_sursa)
            ) AS nr_cat_comune,

            (
                SELECT COUNT(*)
                FROM (
                    SELECT DISTINCT d2.id_actor
                    FROM vizualizari v2
                    JOIN distributie d2 ON v2.id_film = d2.id_film
                    WHERE v2.id_client = c.id
                      AND COALESCE(v2.vot, 0) >= 7
                ) act_alt
                WHERE act_alt.id_actor IN (SELECT id_actor FROM actori_sursa)
            ) AS nr_actori_comuni,

            COALESCE((
                SELECT ROUND(
                    (1 - AVG(ABS(rs.avg_vot - COALESCE(v2.vot, 5))) / 9.0)::NUMERIC,
                    2
                )
                FROM vizualizari v2
                JOIN filme f2 ON v2.id_film = f2.id
                JOIN rating_sursa rs ON f2.id_categorie = rs.id_categorie
                WHERE v2.id_client = c.id
                  AND v2.vot IS NOT NULL
            ), 0) AS sim_rating,

            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM comentarii_filme cf2
                    JOIN sentiment_sursa ss ON cf2.sentiment = ss.sentiment
                    WHERE cf2.id_client = c.id
                ) THEN 1
                ELSE 0
            END AS sim_sentiment,

            (SELECT COUNT(*) FROM cat_sursa) AS total_cat_sursa,
            (SELECT COUNT(*) FROM actori_sursa) AS total_actori_sursa
        FROM clienti c
        WHERE c.id <> p_id_client
          AND c.activ = TRUE
    )
SELECT s.cid,
       s.nume_c,
       s.oras_c,
       ROUND(
               COALESCE(s.nr_cat_comune ::NUMERIC / NULLIF(s.total_cat_sursa, 0) * 40, 0) +
               COALESCE(s.sim_rating * 30, 0) +
               COALESCE(s.nr_actori_comuni ::NUMERIC / NULLIF(s.total_actori_sursa, 0) * 20, 0) +
               COALESCE(s.sim_sentiment * 10, 0),
               2
       ) AS scor_final,
       s.nr_cat_comune,
       s.nr_actori_comuni,
       (
           'Categorii comune: ' || s.nr_cat_comune ||
           ' | Actori comuni: ' || s.nr_actori_comuni ||
           ' | Similaritate rating: ' || ROUND(s.sim_rating * 30, 1) || '/30' ||
           ' | Sentiment: ' || (s.sim_sentiment * 10) || '/10'
           ) ::TEXT AS motiv
FROM scoruri s
WHERE s.nr_cat_comune > 0
ORDER BY scor_final DESC LIMIT p_numar_max;
END;
$$
LANGUAGE plpgsql @@


-- Functie: genereaza recomandari personalizate pentru un client
-- Scor compozit:
--   40% - compatibilitate categorie
--   30% - rating-ul filmului
--   20% - popularitate
--   10% - actori preferati
CREATE OR REPLACE FUNCTION fn_genereaza_recomandari(
    p_id_client INTEGER,
    p_numar_max INTEGER DEFAULT 10
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
    IF NOT EXISTS (SELECT 1 FROM clienti cl WHERE cl.id = p_id_client) THEN
        RAISE EXCEPTION 'CLIENT_INEXISTENT: Clientul cu id % nu exista.', p_id_client
            USING ERRCODE = 'P0002';
    END IF;

SELECT COUNT(*)
INTO v_total_viz
FROM vizualizari vz
WHERE vz.id_client = p_id_client;

DELETE
FROM recomandari r
WHERE r.id_client = p_id_client;

WITH profil_categorii AS (SELECT f.id_categorie, COUNT(*) ::NUMERIC / NULLIF(v_total_viz, 0) AS pondere
                          FROM vizualizari vz
                          JOIN filme f ON vz.id_film = f.id
                          WHERE vz.id_client = p_id_client
                          GROUP BY f.id_categorie),
     actori_preferati AS (SELECT DISTINCT d.id_actor
                          FROM vizualizari vz
                                   JOIN distributie d ON vz.id_film = d.id_film
                          WHERE vz.id_client = p_id_client
                            AND vz.vot >= 7),
     max_viz AS (SELECT GREATEST(MAX(t.cnt), 1) AS max_cnt
                 FROM (SELECT COUNT(*) AS cnt
                       FROM vizualizari vz_pop
                       GROUP BY vz_pop.id_film) t),
     scoruri AS (SELECT f.id AS film_id,
                        f.titlu  AS titlu_film,
                        cat.nume AS categorie_nume,
                        f.rating AS rating_film,
                        COALESCE(pc.pondere, 0) * 40 AS scor_categorie,
                        (f.rating / 10.0) * 30 AS scor_rating,
                        (COUNT(vg.id)::NUMERIC / mv.max_cnt) * 20 AS scor_popularitate,
                        CASE
                            WHEN EXISTS (SELECT 1
                                         FROM distributie d2
                                                  JOIN actori_preferati ap ON d2.id_actor = ap.id_actor
                                         WHERE d2.id_film = f.id) THEN 10
                            ELSE 0
                            END                                   AS scor_actori
                 FROM filme f
                          JOIN categorii cat ON f.id_categorie = cat.id
                          LEFT JOIN profil_categorii pc ON f.id_categorie = pc.id_categorie
                          LEFT JOIN vizualizari vg ON f.id = vg.id_film
                          CROSS JOIN max_viz mv
                 WHERE f.activ = TRUE
                   AND NOT EXISTS (SELECT 1
                                   FROM vizualizari vz_client
                                   WHERE vz_client.id_film = f.id
                                     AND vz_client.id_client = p_id_client)
                 GROUP BY f.id,
                          f.titlu,
                          cat.nume,
                          f.rating,
                          pc.pondere,
                          mv.max_cnt)
INSERT
INTO recomandari(id_client, id_film, scor, motiv)
SELECT p_id_client,
       s.film_id,
       ROUND(s.scor_categorie + s.scor_rating + s.scor_popularitate + s.scor_actori, 2),
       'Categorie: ' || ROUND(s.scor_categorie, 1) ||
       '/40 | Rating: ' || ROUND(s.scor_rating, 1) ||
       '/30 | Popularitate: ' || ROUND(s.scor_popularitate, 1) ||
       '/20 | Actori: ' || s.scor_actori || '/10'
FROM scoruri s
ORDER BY (s.scor_categorie + s.scor_rating + s.scor_popularitate + s.scor_actori) DESC LIMIT p_numar_max;

RETURN QUERY
SELECT r.id_film,
       f.titlu,
       c.nume::VARCHAR AS categorie, f.rating,
       r.scor,
       r.motiv
FROM recomandari r
         JOIN filme f ON r.id_film = f.id
         JOIN categorii c ON f.id_categorie = c.id
WHERE r.id_client = p_id_client
ORDER BY r.scor DESC;
END;
$$
LANGUAGE plpgsql @@


-- Functie: returneaza topul filmelor dupa rating si numar de voturi
CREATE OR REPLACE FUNCTION fn_top_filme(
    p_id_categorie  INTEGER DEFAULT NULL,
    p_numar         INTEGER DEFAULT 10
)
RETURNS TABLE (
    id_film             INTEGER,
    titlu               VARCHAR,
    categorie           VARCHAR,
    rating              NUMERIC,
    numar_voturi        INTEGER,
    numar_vizualizari   BIGINT
) AS $$
BEGIN
RETURN QUERY
SELECT f.id,
       f.titlu,
       c.nume::VARCHAR, f.rating,
       f.numar_voturi,
       COUNT(v.id) AS numar_vizualizari
FROM filme f
         JOIN categorii c ON f.id_categorie = c.id
         LEFT JOIN vizualizari v ON f.id = v.id_film
WHERE f.activ = TRUE
  AND (p_id_categorie IS NULL OR f.id_categorie = p_id_categorie)
GROUP BY f.id, f.titlu, c.nume, f.rating, f.numar_voturi
ORDER BY f.rating DESC, f.numar_voturi DESC LIMIT p_numar;
END;
$$
LANGUAGE plpgsql @@


-- Functie: returneaza istoricul complet al vizualizarilor unui client
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
SELECT f.id,
       f.titlu,
       c.nume::VARCHAR, v.data_vizualizare,
       v.vot,
       cf.continut,
       cf.sentiment
FROM vizualizari v
         JOIN filme f ON v.id_film = f.id
         JOIN categorii c ON f.id_categorie = c.id
         LEFT JOIN comentarii_filme cf
                   ON cf.id_client = p_id_client
                       AND cf.id_film = f.id
WHERE v.id_client = p_id_client
ORDER BY v.data_vizualizare DESC;
END;
$$
LANGUAGE plpgsql @@


-- Functie: grupeaza vizualizarile filmelor pe sezoane
CREATE OR REPLACE FUNCTION fn_statistici_sezoniere(p_id_film INTEGER DEFAULT NULL)
RETURNS TABLE (
    sezon               VARCHAR,
    numar_vizualizari   BIGINT,
    rating_mediu        NUMERIC,
    titlu_film          VARCHAR
) AS $$
BEGIN
RETURN QUERY
SELECT CASE
           WHEN EXTRACT(MONTH FROM v.data_vizualizare) IN (12, 1, 2) THEN 'Iarna'
           WHEN EXTRACT(MONTH FROM v.data_vizualizare) IN (3, 4, 5) THEN 'Primavara'
           WHEN EXTRACT(MONTH FROM v.data_vizualizare) IN (6, 7, 8) THEN 'Vara'
           ELSE 'Toamna'
           END::VARCHAR AS sezon, COUNT(v.id) AS numar_vizualizari,
       ROUND(AVG(v.vot)::NUMERIC, 2) AS rating_mediu,
       f.titlu::VARCHAR
FROM vizualizari v
         JOIN filme f ON v.id_film = f.id
WHERE (p_id_film IS NULL OR v.id_film = p_id_film)
GROUP BY sezon, f.titlu
ORDER BY numar_vizualizari DESC;
END;
$$
LANGUAGE plpgsql @@


-- Functie: estimeaza filmele populare pentru un anumit sezon
-- Scor:
--   50% - media vizualizarilor istorice in sezonul dat
--   30% - rating-ul general al filmului
--   20% - tendinta recenta (ultimele 2 sezoane similare)
CREATE OR REPLACE FUNCTION fn_predictii_sezoniere(
    p_sezon     VARCHAR,
    p_numar_max INTEGER DEFAULT 10
)
RETURNS TABLE (
    id_film             INTEGER,
    titlu               VARCHAR,
    categorie           VARCHAR,
    rating              NUMERIC,
    viz_istorice_sezon  BIGINT,
    tendinta_recenta    BIGINT,
    scor_predictie      NUMERIC,
    explicatie          TEXT
) AS $$
DECLARE
v_luni_sezon INTEGER[];
BEGIN
    v_luni_sezon
:= CASE p_sezon
        WHEN 'Iarna' THEN ARRAY[12, 1, 2]
        WHEN 'Primavara' THEN ARRAY[3, 4, 5]
        WHEN 'Vara' THEN ARRAY[6, 7, 8]
        WHEN 'Toamna' THEN ARRAY[9, 10, 11]
        ELSE NULL
END;

    IF v_luni_sezon IS NULL THEN
        RAISE EXCEPTION 'SEZON_INVALID: Sezonul % nu este valid. Valori acceptate: Iarna, Primavara, Vara, Toamna.', p_sezon
            USING ERRCODE = 'P0009';
    END IF;

RETURN QUERY WITH
    viz_sezon AS (
        SELECT
            v.id_film,
            COUNT(*) AS total_viz_sezon
        FROM vizualizari v
        WHERE EXTRACT(MONTH FROM v.data_vizualizare) = ANY(v_luni_sezon)
        GROUP BY v.id_film
    ),
    tendinta AS (
        SELECT
            v.id_film,
            COUNT(*) AS viz_recente
        FROM vizualizari v
        WHERE EXTRACT(MONTH FROM v.data_vizualizare) = ANY(v_luni_sezon)
          AND v.data_vizualizare >= NOW() - INTERVAL '2 years'
        GROUP BY v.id_film
    ),
    maxuri AS (
        SELECT
            GREATEST(COALESCE((SELECT MAX(total_viz_sezon) FROM viz_sezon), 0), 1) AS max_viz,
            GREATEST(COALESCE((SELECT MAX(viz_recente) FROM tendinta), 0), 1) AS max_tendinta
    )
SELECT f.id,
       f.titlu,
       c.nume::VARCHAR, f.rating,
       COALESCE(vs.total_viz_sezon, 0) AS viz_istorice_sezon,
       COALESCE(t.viz_recente, 0)      AS tendinta_recenta,
       ROUND(
               (COALESCE(vs.total_viz_sezon, 0)::NUMERIC / mx.max_viz * 50) +
               (f.rating / 10.0 * 30) +
               (COALESCE(t.viz_recente, 0)::NUMERIC / mx.max_tendinta * 20),
               2
       )                               AS scor_predictie,
       (
           'Vizualizari istorice in ' || p_sezon || ': ' || COALESCE(vs.total_viz_sezon, 0) ||
           ' | Rating: ' || f.rating ||
           ' | Tendinta recenta: ' || COALESCE(t.viz_recente, 0)
           ) ::TEXT AS explicatie
FROM filme f
         JOIN categorii c ON f.id_categorie = c.id
         CROSS JOIN maxuri mx
         LEFT JOIN viz_sezon vs ON f.id = vs.id_film
         LEFT JOIN tendinta t ON f.id = t.id_film
WHERE f.activ = TRUE
ORDER BY scor_predictie DESC LIMIT p_numar_max;
END;
$$
LANGUAGE plpgsql @@
