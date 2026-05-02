--Trigger 1: Recalculare rating film la fiecare vot nou/modificat
CREATE OR REPLACE FUNCTION recalculeazaRating()
       RETURNS TRIGGER As $$
BEGIN
    UPDATE  filme
    SET rating = (
        SELECT ROUND(AVG(vot)::NUMERIC, 2) FROM vizualizari WHERE id_film = NEW.id_film AND vot IS NOT NULL
        ),
    numar_voturi = (
        SELECT COUNT(*) FROM vizualizari where id_film = NEW.id_film AND vot IS NOT NULL
        )
    WHERE id = NEW.id_film;
RETURN NEW;
END;
$$ Language plpgsql;

CREATE TRIGGER trg_recalculeazaRating
    AFTER INSERT OR UPDATE OF vot ON vizualizari FOR EACH ROW WHEN (NEW.vot IS NOT NULL)
    EXECUTE FUNCTION recalculeazaRating();

--Trigger 2: Analiza automata sentiment comentariu
CREATE OR REPLACE FUNCTION analizaSentiment ()
       RETURNS TRIGGER As $$
DECLARE
    v_text TEXT;
    v_scor_pozitiv INTEGER := 0;
    v_scor_negativ INTEGER := 0;

    cuvinte_pozitive TEXT[] := ARRAY[
        'excelent', 'superb', 'minunat', 'fantastic', 'extraordinar',
        'placut', 'bun', 'frumos', 'recomandat', 'genial', 'captivant',
        'impresionant', 'magistral', 'senzational', 'uimitor', 'perfect',
        'excellent', 'great', 'amazing', 'wonderful', 'brilliant', 'love',
        'best', 'awesome', 'outstanding', 'masterpiece'
    ];
    cuvinte_negative TEXT[] := ARRAY[
        'plictisitor', 'slab', 'dezamagitor', 'oribil', 'rau',
        'banal', 'mediocru', 'enervant', 'groaznic', 'teribil', 'urat',
        'boring', 'bad', 'terrible', 'awful', 'worst', 'hate', 'poor',
        'disappointing', 'weak', 'horrible', 'waste', 'dreadful'
    ];
    cuvant TEXT;
BEGIN
    v_text := LOWER(COALESCE(NEW.continut, ''));

     FOREACH cuvant IN ARRAY cuvinte_pozitive LOOP
        IF v_text LIKE '%' || cuvant || '%' THEN
            v_scor_pozitiv := v_scor_pozitiv + 1;
        END IF;
    END LOOP;

    FOREACH cuvant IN ARRAY cuvinte_negative LOOP
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_analizaSentiment
    BEFORE INSERT OR UPDATE OF continut ON comentarii_filme FOR EACH ROW
    EXECUTE FUNCTION analizaSentiment();

-- Trigger 3: Audit log pentru operatii pe clienti
CREATE OR REPLACE FUNCTION auditClienti()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(tabel_nume, operatie, id_rand, detalii)
        VALUES ('clienti', 'INSERT', NEW.id, 'Client nou: ' || NEW.prenume || ' ' || NEW.nume || ' (' || NEW.email || ')');
    RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(tabel_nume, operatie, id_rand, detalii)
        VALUES ('clienti', 'UPDATE', NEW.id, 'Client modificat: ' || NEW.email);
    RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(tabel_nume, operatie, id_rand, detalii)
        VALUES ('clienti', 'DELETE', OLD.id, 'Client sters: ' || OLD.email);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auditClienti
    AFTER INSERT OR UPDATE OR DELETE ON clienti FOR EACH ROW
    EXECUTE FUNCTION auditClienti();