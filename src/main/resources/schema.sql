--Stergere tabele in ordine inversa dependentelor
Drop Table If Exists recomandari Cascade;
Drop Table If Exists optiuni_selectate Cascade;
Drop Table If Exists comentarii_actori Cascade;
Drop Table If Exists comentarii_filme Cascade;
Drop Table If Exists vizualizari Cascade;
Drop Table If Exists versiuni_film Cascade;
Drop Table If Exists distributie Cascade;
Drop Table If Exists filme Cascade;
Drop Table If Exists actori Cascade;
Drop Table If Exists clienti Cascade;
Drop Table If Exists categorii Cascade;
Drop Table If Exists optiuni_predefinite Cascade;
Drop Table If Exists audit_log Cascade;

-- Categorii
Create Table categorii (
    id Serial PRIMARY KEY,
    nume VARCHAR(100) NOT NULL UNIQUE,
    descriere TEXT
);

-- Actori
Create Table actori (
    id Serial PRIMARY KEY,
    nume_scena VARCHAR(150) NOT NULL UNIQUE,
    prenume VARCHAR(100) NOT NULL,
    nume_familie VARCHAR(100) NOT NULL,
    data_nasterii DATE,
    nationalitate VARCHAR(100),
    biografie TEXT
);

-- Filme
Create Table filme (
    id Serial PRIMARY KEY,
    titlu VARCHAR(255) NOT NULL,
    descriere TEXT,
    data_lansarii DATE,
    durata_minute INTEGER CHECK (durata_minute > 0),
    id_categorie INTEGER NOT NULL REFERENCES categorii(id) ON DELETE RESTRICT,
    rating NUMERIC(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 10),
    numar_voturi INTEGER DEFAULT 0,
    poster_url VARCHAR(500),
    activ BOOLEAN DEFAULT TRUE
);

-- Versiuni film
Create Table versiuni_film (
    id Serial PRIMARY KEY,
    id_film INTEGER NOT NULL REFERENCES filme(id) ON DELETE CASCADE,
    format VARCHAR(50) NOT NULL,
    rezolutie VARCHAR(20),
    limba VARCHAR(50) NOT NULL,
    subtitrare VARCHAR(50),
    UNIQUE(id_film, format, limba)
);

-- Distributie
Create Table distributie (
    id Serial PRIMARY KEY,
    id_film INTEGER NOT NULL REFERENCES filme(id) ON DELETE CASCADE,
    id_actor INTEGER NOT NULL REFERENCES actori(id) ON DELETE CASCADE,
    rol VARCHAR(255),
    tip_rol VARCHAR(50) CHECK (tip_rol IN ('Principal', 'Secundar', 'Figuratie')),
    UNIQUE(id_film, id_actor)
);

-- Clienti
Create Table clienti (
    id Serial PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    prenume VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    parola_hash VARCHAR(255) NOT NULL,
    telefon VARCHAR(20),
    telefon_mobil VARCHAR(20),
    adresa TEXT,
    oras VARCHAR(100),
    data_nasterii DATE,
    data_inregistrare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activ BOOLEAN DEFAULT TRUE
);

-- Vizualizari
Create Table vizualizari (
    id Serial PRIMARY KEY,
    id_client INTEGER NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
    id_film INTEGER NOT NULL REFERENCES filme(id) ON DELETE CASCADE,
    id_versiune INTEGER REFERENCES versiuni_film(id) ON DELETE SET NULL,
    data_vizualizare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    durata_vizionata INTEGER DEFAULT 0,
    finalizata BOOLEAN DEFAULT FALSE,
    vot INTEGER CHECK (vot >= 1 AND vot <= 10)
);

-- Optiuni Predefinite
-- Lista de optiuni bifabile pentru comentarii
Create Table optiuni_predefinite (
    id Serial PRIMARY KEY,
    cod VARCHAR(50) NOT NULL UNIQUE,
    eticheta VARCHAR(100) NOT NULL,
    tip VARCHAR(20) CHECK (tip IN ('pozitiv', 'negativ', 'neutru'))
);

-- Comentarii filme
-- Comentariile clientilor despre filme, cu analiza sentiment
Create TABLE comentarii_filme
(
    id Serial PRIMARY KEY,
    id_client INTEGER NOT NULL REFERENCES clienti (id) ON DELETE CASCADE,
    id_film INTEGER NOT NULL REFERENCES filme (id) ON DELETE CASCADE,
    continut TEXT,
    sentiment VARCHAR(20) CHECK (sentiment IN ('pozitiv', 'negativ', 'neutru')),
    data_comentariu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_client, id_film)
);

-- Optiuni Selectate
-- Optiunile bifate de un client la un comentariu de film
Create Table optiuni_selectate (
    id Serial PRIMARY KEY,
    id_comentariu INTEGER NOT NULL REFERENCES comentarii_filme(id) ON DELETE CASCADE,
    id_optiune INTEGER NOT NULL REFERENCES optiuni_predefinite(id) ON DELETE CASCADE,
    UNIQUE(id_comentariu, id_optiune)
);

-- Comentarii Actori
-- Comentariile clientilor despre actori intr-un film specific
Create Table comentarii_actori (
    id Serial PRIMARY KEY,
    id_client INTEGER NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
    id_actor INTEGER NOT NULL REFERENCES actori(id) ON DELETE CASCADE,
    id_film INTEGER REFERENCES filme(id) ON DELETE SET NULL,
    continut TEXT NOT NULL,
    data_comentariu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recomandari
-- Recomandarile generate de algoritm pentru fiecare client
Create Table recomandari (
    id Serial PRIMARY KEY,
    id_client INTEGER NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
    id_film INTEGER NOT NULL REFERENCES filme(id) ON DELETE CASCADE,
    scor NUMERIC(5,2) NOT NULL,
    motiv TEXT,
    data_generare   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vizualizata     BOOLEAN DEFAULT FALSE,
    UNIQUE(id_client, id_film)
);

-- Audit Log
-- Log automat al operatiunilor importante (trigger)
Create Table audit_log (
    id Serial PRIMARY KEY,
    tabel_nume VARCHAR(100) NOT NULL,
    operatie VARCHAR(10) NOT NULL,
    id_rand INTEGER,
    detalii TEXT,
    data_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vizualizari_client ON vizualizari(id_client);
CREATE INDEX idx_vizualizari_film ON vizualizari(id_film);
CREATE INDEX idx_vizualizari_data ON vizualizari(data_vizualizare);
CREATE INDEX idx_comentarii_film ON comentarii_filme(id_film);
CREATE INDEX idx_recomandari_client ON recomandari(id_client);
CREATE INDEX idx_filme_categorie ON filme(id_categorie);
CREATE INDEX idx_distributie_film ON distributie(id_film);
CREATE INDEX idx_distributie_actor ON distributie(id_actor);