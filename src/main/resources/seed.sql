-- ============================================================
-- CINEMATE - Date initiale (seed)
-- ============================================================

-- CATEGORII (15 inregistrari)
INSERT INTO categorii(nume, descriere) VALUES
                                           ('Action',       'Filme cu actiune, lupte si adrenalina'),
                                           ('Comedie',      'Filme amuzante si de divertisment'),
                                           ('Drama',        'Filme cu povesti emotionante si profunde'),
                                           ('Thriller',     'Filme cu suspans si tensiune'),
                                           ('SF',           'Science fiction, viitor si tehnologie'),
                                           ('Horror',       'Filme de groaza'),
                                           ('Romantic',     'Filme de dragoste'),
                                           ('Animatie',     'Filme animate pentru toate varstele'),
                                           ('Documentar',   'Documentare despre lume si natura'),
                                           ('Aventura',     'Calatorii si explorari'),
                                           ('Mister',       'Enigme si investigatii'),
                                           ('Fantezie',     'Lumi magice si imaginare'),
                                           ('Istoric',      'Filme cu tematica istorica'),
                                           ('Muzical',      'Filme cu muzica si dans'),
                                           ('Sport',        'Filme despre sport si performanta');

-- ACTORI (20 inregistrari)
INSERT INTO actori(nume_scena, prenume, nume_familie, data_nasterii, nationalitate) VALUES
                                                                                        ('Leonardo DiCaprio', 'Leonardo',  'DiCaprio',    '1974-11-11', 'American'),
                                                                                        ('Meryl Streep',      'Meryl',     'Streep',       '1949-06-22', 'American'),
                                                                                        ('Tom Hanks',         'Tom',       'Hanks',        '1956-07-09', 'American'),
                                                                                        ('Cate Blanchett',    'Cate',      'Blanchett',    '1969-05-14', 'Australian'),
                                                                                        ('Brad Pitt',         'Brad',      'Pitt',         '1963-12-18', 'American'),
                                                                                        ('Natalie Portman',   'Natalie',   'Portman',      '1981-06-09', 'Israeli-American'),
                                                                                        ('Christian Bale',    'Christian', 'Bale',         '1974-01-30', 'British'),
                                                                                        ('Scarlett Johansson','Scarlett',  'Johansson',    '1984-11-22', 'American'),
                                                                                        ('Morgan Freeman',    'Morgan',    'Freeman',      '1937-06-01', 'American'),
                                                                                        ('Emma Stone',        'Emma',      'Stone',        '1988-11-06', 'American'),
                                                                                        ('Ryan Gosling',      'Ryan',      'Gosling',      '1980-11-12', 'Canadian'),
                                                                                        ('Anne Hathaway',     'Anne',      'Hathaway',     '1982-11-12', 'American'),
                                                                                        ('Johnny Depp',       'Johnny',    'Depp',         '1963-06-09', 'American'),
                                                                                        ('Julia Roberts',     'Julia',     'Roberts',      '1967-10-28', 'American'),
                                                                                        ('Denzel Washington', 'Denzel',    'Washington',   '1954-12-28', 'American'),
                                                                                        ('Angelina Jolie',    'Angelina',  'Jolie',        '1975-06-04', 'American'),
                                                                                        ('Matt Damon',        'Matt',      'Damon',        '1970-10-08', 'American'),
                                                                                        ('Charlize Theron',   'Charlize',  'Theron',       '1975-08-07', 'South African'),
                                                                                        ('Robert Downey Jr.', 'Robert',    'Downey Jr.',   '1965-04-04', 'American'),
                                                                                        ('Viola Davis',       'Viola',     'Davis',        '1965-08-11', 'American');

-- FILME (20 inregistrari)
INSERT INTO filme(titlu, descriere, data_lansarii, durata_minute, id_categorie, poster_url) VALUES
                                                                                                ('Inception',           'Un hot care fura secrete din vise incearca sa implanteze o idee.',          '2010-07-16', 148, 5,  'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg'),
                                                                                                ('The Dark Knight',     'Batman se confrunta cu Joker intr-o batalie pentru Gotham.',                '2008-07-18', 152, 1,  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
                                                                                                ('Forrest Gump',        'Viata extraordinara a unui om simplu din Alabama.',                          '1994-07-06', 142, 3,  'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg'),
                                                                                                ('Interstellar',        'Astronauti calatoresc prin gauri de vierme pentru a salva omenirea.',       '2014-11-07', 169, 5,  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'),
                                                                                                ('The Revenant',        'Un vanator supravietuieste in conditii extreme in America de Nord.',         '2015-12-25', 156, 1,  'https://image.tmdb.org/t/p/w500/oDykyl4B2w7vS8WnGJoMPFWObB0.jpg'),
                                                                                                ('La La Land',          'O actrita si un muzician se indragostesc in Los Angeles.',                   '2016-12-09', 128, 14, 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg'),
                                                                                                ('Schindler\'s List',   'Povestea lui Oskar Schindler care salveaza evreii in WW2.',                 '1993-11-30', 195, 13, 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg'),
('The Silence of the Lambs', 'O agenta FBI consulta un cannibal pentru a prinde un criminal.',      '1991-02-14', 118, 11, 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg'),
('Titanic',             'O poveste de dragoste pe nava fatidica Titanic.',                            '1997-12-19', 194, 7,  'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg'),
('The Matrix',          'Un hacker descopera ca lumea este o simulare.',                              '1999-03-31', 136, 5,  'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'),
('Goodfellas',          'Ascensiunea si caderea unui gangster in New York.',                          '1990-09-19', 146, 3,  'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg'),
('Pulp Fiction',        'Povesti interconectate din lumea infractionala.',                            '1994-10-14', 154, 4,  'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'),
('The Lion King',       'Un pui de leu fuge dupa moartea tatalui sau si trebuie sa devina rege.',   '1994-06-24', 88,  8,  'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg'),
('Avatar',              'Un marine paralitic exploreaza o luna straina si se alatura nativilor.',    '2009-12-18', 162, 10, 'https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg'),
('The Shawshank Redemption', 'Un bancher condamnat nedrept isi gaseste speranta in inchisoare.',   '1994-09-23', 142, 3,  'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'),
('Gladiator',           'Un general roman devine gladiator pentru a se razbuna.',                    '2000-05-05', 155, 1,  'https://image.tmdb.org/t/p/w500/ehGpAZi4RoS2kfaOrT2aMJXYKcr.jpg'),
('Up',                  'Un batranel isi ataseaza casa de baloane si zboara spre Paradis Falls.',    '2009-05-29', 96,  8,  'https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg'),
('Get Out',             'Un tanar afro-american descopera secrete ingrozitoare la familia iubitei.', '2017-02-24', 104, 6,  'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg'),
('Parasite',            'O familie saraca se infiltreaza intr-o familie bogata.',                    '2019-05-30', 132, 4,  'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'),
('Oppenheimer',         'Povestea omului care a creat bomba atomica.',                               '2023-07-21', 180, 13, 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg');

-- VERSIUNI FILM (fiecare film are 2-3 versiuni)
INSERT INTO versiuni_film(id_film, format, rezolutie, limba, subtitrare) VALUES
(1, 'HD',  '1920x1080', 'Engleza',  'Romana'),
(1, '4K',  '3840x2160', 'Engleza',  'fara'),
(2, 'HD',  '1920x1080', 'Engleza',  'Romana'),
(2, 'SD',  '1280x720',  'Romana',   'fara'),
(3, 'HD',  '1920x1080', 'Engleza',  'Romana'),
(4, '4K',  '3840x2160', 'Engleza',  'fara'),
(4, 'HD',  '1920x1080', 'Romana',   'fara'),
(5, 'HD',  '1920x1080', 'Engleza',  'Romana'),
(6, 'HD',  '1920x1080', 'Engleza',  'Romana'),
(7, 'HD',  '1920x1080', 'Engleza',  'Romana'),
(8, 'SD',  '1280x720',  'Engleza',  'Romana'),
(9, '4K',  '3840x2160', 'Engleza',  'fara'),
(9, 'HD',  '1920x1080', 'Romana',   'fara'),
(10, 'HD', '1920x1080', 'Engleza',  'Romana'),
(11, 'HD', '1920x1080', 'Engleza',  'Romana'),
(12, 'HD', '1920x1080', 'Engleza',  'Romana'),
(13, 'HD', '1920x1080', 'Romana',   'fara'),
(14, '4K', '3840x2160', 'Engleza',  'fara'),
(15, 'HD', '1920x1080', 'Engleza',  'Romana'),
(16, 'HD', '1920x1080', 'Engleza',  'Romana'),
(17, 'HD', '1920x1080', 'Romana',   'fara'),
(18, 'HD', '1920x1080', 'Engleza',  'Romana'),
(19, 'HD', '1920x1080', 'Engleza',  'Romana'),
(20, '4K', '3840x2160', 'Engleza',  'Romana');

-- DISTRIBUTIE
INSERT INTO distributie(id_film, id_actor, rol, tip_rol) VALUES
(1,  1,  'Dom Cobb',         'Principal'),
(1,  12, 'Ariadne',          'Secundar'),
(2,  7,  'Bruce Wayne',      'Principal'),
(3,  3,  'Forrest Gump',     'Principal'),
(4,  1,  'Cooper',           'Principal'),
(4,  12, 'Brand',            'Secundar'),
(5,  1,  'Hugh Glass',       'Principal'),
(6,  11, 'Sebastian',        'Principal'),
(6,  10, 'Mia',              'Principal'),
(7,  9,  'Stern',            'Secundar'),
(8,  2,  'Clarice Starling', 'Principal'),
(9,  1,  'Jack Dawson',      'Principal'),
(10, 17, 'Neo',              'Principal'),
(11, 5,  'Henry Hill',       'Principal'),
(12, 5,  'Vincent Vega',     'Principal'),
(13, 9,  'Simba (voce)',     'Principal'),
(14, 18, 'Theron',           'Secundar'),
(15, 9,  'Red',              'Principal'),
(16, 17, 'Maximus',          'Principal'),
(17, 3,  'Carl Fredricksen', 'Principal'),
(18, 19, 'Tony Stark',       'Secundar'),
(19, 20, 'Andre',            'Principal'),
(20, 6,  'Katherine',        'Principal');

-- CLIENTI (20 inregistrari)
INSERT INTO clienti(nume, prenume, email, parola_hash, telefon, oras) VALUES
('Ionescu',   'Andrei',   'andrei.ionescu@email.ro',   md5('parola1'), '0721111111', 'Bucuresti'),
('Popescu',   'Maria',    'maria.popescu@email.ro',    md5('parola2'), '0722222222', 'Cluj-Napoca'),
('Dumitrescu','Ion',      'ion.dumitrescu@email.ro',   md5('parola3'), '0723333333', 'Iasi'),
('Constantin','Elena',    'elena.constantin@email.ro', md5('parola4'), '0724444444', 'Timisoara'),
('Gheorghe',  'Mihai',    'mihai.gheorghe@email.ro',   md5('parola5'), '0725555555', 'Brasov'),
('Stoica',    'Ana',      'ana.stoica@email.ro',       md5('parola6'), '0726666666', 'Constanta'),
('Marin',     'Cristian', 'cristian.marin@email.ro',  md5('parola7'), '0727777777', 'Galati'),
('Tudor',     'Ioana',    'ioana.tudor@email.ro',      md5('parola8'), '0728888888', 'Craiova'),
('Dima',      'Alexandru','alex.dima@email.ro',        md5('parola9'), '0729999999', 'Ploiesti'),
('Vasile',    'Gabriela', 'gabriela.vasile@email.ro',  md5('parolaa'), '0730000000', 'Oradea'),
('Popa',      'Razvan',   'razvan.popa@email.ro',      md5('parolab'), '0731111111', 'Arad'),
('Moldovan',  'Simona',   'simona.moldovan@email.ro',  md5('parolac'), '0732222222', 'Cluj-Napoca'),
('Rusu',      'Florin',   'florin.rusu@email.ro',      md5('parolad'), '0733333333', 'Sibiu'),
('Niculescu', 'Teodora',  'teodora.niculescu@email.ro',md5('parolae'), '0734444444', 'Bacau'),
('Manea',     'Bogdan',   'bogdan.manea@email.ro',     md5('parolaf'), '0735555555', 'Pitesti'),
('Luca',      'Daniela',  'daniela.luca@email.ro',     md5('parolag'), '0736666666', 'Targu Mures'),
('Barbu',     'Cosmin',   'cosmin.barbu@email.ro',     md5('parolah'), '0737777777', 'Buzau'),
('Matei',     'Laura',    'laura.matei@email.ro',      md5('parolai'), '0738888888', 'Ramnicu Valcea'),
('Neagu',     'Silviu',   'silviu.neagu@email.ro',     md5('parolaj'), '0739999999', 'Drobeta'),
('Cretu',     'Carmen',   'carmen.cretu@email.ro',     md5('parolak'), '0740000000', 'Alexandria');

-- VIZUALIZARI (populare automata - minim 15 pe client)
-- Client 1 (SF, Action)
INSERT INTO vizualizari(id_client, id_film, id_versiune, data_vizualizare, finalizata, vot) VALUES
(1, 1,  1, '2024-01-05 20:00', TRUE, 9),
(1, 2,  3, '2024-01-12 19:30', TRUE, 8),
(1, 4,  6, '2024-02-01 21:00', TRUE, 10),
(1, 10, 14,'2024-02-14 22:00', TRUE, 9),
(1, 5,  8, '2024-03-01 20:30', TRUE, 7),
(1, 14, 19,'2024-03-15 19:00', TRUE, 8),
(1, 16, 20,'2024-04-01 20:00', TRUE, 9),
(1, 20, 24,'2024-04-10 21:30', TRUE, 8),
(1, 6,  9, '2024-05-01 20:00', TRUE, 7),
(1, 3,  5, '2024-05-20 19:00', TRUE, 8),
(1, 15, 19,'2024-06-01 20:30', TRUE, 9),
(1, 11, 15,'2024-06-15 21:00', TRUE, 7),
(1, 12, 16,'2024-07-01 22:00', TRUE, 8),
(1, 7,  10,'2024-07-20 19:30', TRUE, 9),
(1, 18, 22,'2024-08-01 20:00', TRUE, 6),
-- Client 2 (Drama, Romantic)
(2, 3,  5, '2024-01-10 20:00', TRUE, 9),
(2, 9,  12,'2024-01-25 21:00', TRUE, 10),
(2, 6,  9, '2024-02-14 20:30', TRUE, 9),
(2, 15, 19,'2024-02-28 19:00', TRUE, 8),
(2, 7,  10,'2024-03-10 20:00', TRUE, 9),
(2, 11, 15,'2024-03-25 21:30', TRUE, 7),
(2, 13, 17,'2024-04-05 19:00', TRUE, 8),
(2, 17, 21,'2024-04-20 20:00', TRUE, 9),
(2, 12, 16,'2024-05-05 21:00', TRUE, 6),
(2, 8,  11,'2024-05-20 20:30', TRUE, 7),
(2, 1,  1, '2024-06-10 19:00', TRUE, 8),
(2, 16, 20,'2024-06-25 20:00', TRUE, 9),
(2, 19, 23,'2024-07-10 21:00', TRUE, 8),
(2, 4,  6, '2024-07-25 20:30', TRUE, 7),
(2, 20, 24,'2024-08-10 19:30', TRUE, 8),
-- Client 3 (Thriller, Mister)
(3, 8,  11,'2024-01-08 21:00', TRUE, 9),
(3, 12, 16,'2024-01-22 22:00', TRUE, 8),
(3, 19, 23,'2024-02-05 20:30', TRUE, 9),
(3, 4,  6, '2024-02-18 21:30', TRUE, 8),
(3, 1,  1, '2024-03-03 20:00', TRUE, 9),
(3, 11, 15,'2024-03-18 21:00', TRUE, 7),
(3, 2,  3, '2024-04-01 22:00', TRUE, 8),
(3, 16, 20,'2024-04-15 20:30', TRUE, 9),
(3, 5,  8, '2024-04-30 21:00', TRUE, 8),
(3, 15, 19,'2024-05-15 20:00', TRUE, 9),
(3, 18, 22,'2024-05-30 21:30', TRUE, 7),
(3, 7,  10,'2024-06-14 20:00', TRUE, 8),
(3, 10, 14,'2024-06-28 21:00', TRUE, 9),
(3, 20, 24,'2024-07-13 22:00', TRUE, 8),
(3, 3,  5, '2024-07-28 19:30', TRUE, 7);

-- OPTIUNI_PREDEFINITE
INSERT INTO optiuni_predefinite(cod, eticheta, tip) VALUES
('like',           'Mi-a placut',          'pozitiv'),
('dislike',        'Nu mi-a placut',        'negativ'),
('interesting',    'Interesant',            'neutru'),
('emotional',      'Emotionant',            'pozitiv'),
('boring',         'Plictisitor',           'negativ'),
('recommend',      'As recomanda',          'pozitiv'),
('rewatch',        'As mai viziona',        'pozitiv'),
('lead_actor',     'Actor principal apreciat', 'pozitiv'),
('weak_script',    'Scenariu slab',         'negativ'),
('great_effects',  'Efecte speciale bune',  'pozitiv'),
('long',           'Prea lung',             'negativ'),
('short',          'Prea scurt',            'negativ'),
('surprising',     'Final neasteptat',      'pozitiv'),
('realistic',      'Realist',               'neutru'),
('original',       'Original',              'pozitiv');

-- COMENTARII FILME (triggerul seteaza automat sentimentul)
INSERT INTO comentarii_filme(id_client, id_film, continut) VALUES
(1, 1,  'Film excelent! Captivant de la inceput pana la sfarsit. Superb vizual.'),
(1, 4,  'Extraordinar! Cel mai bun film SF vazut vreodata. Interstellar e o capodopera.'),
(2, 3,  'Emotionant si minunat. Forrest Gump ramane un film superb de neuitat.'),
(2, 9,  'Titanic e un film de dragoste perfect. Am plans la final. Fantastic!'),
(3, 8,  'Thriller captivant si plin de suspans. Excelent scenariu.'),
(3, 19, 'Parasite e genial! Original si surprinzator. As recomanda tuturor.'),
(1, 2,  'The Dark Knight este magistral. Joker-ul lui Heath Ledger e senzational.'),
(2, 7,  'Schindler''s List e un film greu de privit dar impresionant si necesar.'),
(3, 4,  'Interstellar e uimitor din punct de vedere vizual dar putin plictisitor la final.'),
(1, 16, 'Gladiator e un film de actiune superb. Russell Crowe e extraordinar.');

-- OPTIUNI SELECTATE pentru comentarii
INSERT INTO optiuni_selectate(id_comentariu, id_optiune) VALUES
(1, 1), (1, 6), (1, 7),
(2, 1), (2, 10), (2, 13),
(3, 1), (3, 4), (3, 6),
(4, 1), (4, 4), (4, 6),
(5, 1), (5, 3), (5, 6),
(6, 1), (6, 15), (6, 13),
(7, 1), (7, 8), (7, 6),
(8, 4), (8, 6), (8, 14),
(9, 10),(9, 3), (9, 11),
(10,1), (10,8), (10,6);

-- COMENTARII ACTORI
INSERT INTO comentarii_actori(id_client, id_actor, id_film, continut) VALUES
(1, 1, 1, 'Leonardo DiCaprio e incredibil in Inception. Unul din cele mai bune roluri ale lui.'),
(2, 3, 3, 'Tom Hanks da viata personajului intr-un mod uimitor. Actorie de exceptie.'),
(3, 5, 12,'Brad Pitt e perfect pentru rolul din Pulp Fiction.'),
(1, 7, 2, 'Christian Bale e cel mai bun Batman. Interpretare magistrala.'),
(2, 10,6, 'Emma Stone si Ryan Gosling au chimie perfecta in La La Land.');
