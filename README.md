# MovieSphere

MovieSphere este o aplicație web pentru administrarea și analiza vizualizărilor de filme. Proiectul permite gestionarea filmelor, clienților, actorilor, vizualizărilor, comentariilor și recomandărilor personalizate, folosind un backend Java Spring Boot, o bază de date PostgreSQL și un frontend în HTML, CSS și JavaScript.

## Obiectiv

Scopul aplicației este să simuleze o platformă de filme în care utilizatorii pot vizualiza filme, pot lăsa comentarii, pot acorda voturi și pot primi recomandări pe baza istoricului lor.

Aplicația include două tipuri de utilizatori:

- **admin**: are acces la zona de administrare și analiză a platformei;
- **client**: are acces la funcționalitățile normale de utilizator.

Regulile principale sunt:

- un client poate vizualiza unul sau mai multe filme;
- un client poate vizualiza același film de mai multe ori;
- un client poate lăsa comentariu doar pentru filmele vizualizate;
- comentariile sunt analizate automat ca sentiment pozitiv, negativ sau neutru;
- recomandările personalizate se generează doar dacă utilizatorul are istoric de vizualizări;
- filmele pot avea mai multe versiuni, precum HD, 4K, limbi audio sau subtitrări diferite;
- paginile de administrare sunt disponibile doar pentru utilizatorii cu rol de admin.

## Tehnologii folosite

- Java 25
- Spring Boot
- PostgreSQL
- JDBC Template
- HTML
- CSS
- JavaScript
- REST API
- SQL
- PL/pgSQL
- funcții, proceduri și triggere
- BCrypt pentru parole

## Funcționalități

- autentificare și înregistrare utilizatori;
- roluri de utilizator: admin și client;
- cont de admin pentru administrarea platformei;
- dashboard cu statistici și informații generale, disponibil pentru admin;
- catalog de filme cu afișe, rating, categorii și detalii;
- vizualizare detalii film;
- deschidere trailer pe YouTube din interfață;
- înregistrare vizualizare film;
- selectarea versiunii filmului la adăugarea unei vizualizări;
- acordarea unui vot pentru film;
- comentarii pentru filme;
- validare: utilizatorul poate comenta doar filmele vizualizate;
- mesaje de eroare clare, fără detalii tehnice interne;
- analiză automată a sentimentului comentariilor;
- opțiuni rapide pentru comentarii;
- administrare actori și distribuție;
- comentarii pentru actori;
- validare actor-film;
- profil utilizator cu istoric de vizualizări;
- recomandări personalizate pe baza istoricului;
- mesaj special pentru conturile noi fără vizualizări;
- top filme;
- top clienți activi;
- statistici despre comentarii, sentimente și opțiuni bifate;
- predicții sezoniere pentru filme;
- audit log pentru operații importante;
- interfață frontend în stil vintage;
- separarea meniurilor și paginilor în funcție de rolul utilizatorului.

## Baza de date

Baza de date PostgreSQL conține tabele pentru filme, categorii, clienți, vizualizări, versiuni de film, comentarii, actori, distribuție, recomandări și audit log.

Tabela de clienți include și un câmp de rol, folosit pentru diferențierea între utilizatorii de tip `ADMIN` și utilizatorii de tip `CLIENT`.

O parte importantă din logica aplicației este implementată la nivelul bazei de date prin funcții, proceduri și triggere.

Exemple de reguli implementate în baza de date:

- validarea versiunii unui film;
- adăugarea unei vizualizări;
- adăugarea unui comentariu;
- verificarea faptului că un client poate comenta doar filmele vizualizate;
- analizarea automată a sentimentului unui comentariu;
- generarea recomandărilor;
- calcularea statisticilor sezoniere;
- generarea predicțiilor;
- salvarea operațiilor importante în audit log.

## Roluri

Aplicația folosește două roluri principale:

### Admin

Adminul are acces la funcționalitățile de administrare și analiză:

- dashboard;
- clienți;
- statistici;
- predicții;
- audit log;
- informații generale despre activitatea platformei.

### Client

Clientul are acces la funcționalitățile obișnuite ale platformei:

- catalog filme;
- top filme;
- actori;
- profil propriu;
- recomandări personalizate;
- înregistrare vizualizări;
- comentarii pentru filme.

Paginile de admin sunt ascunse pentru clienți, iar dacă un client încearcă să acceseze manual o pagină de admin, este redirecționat către zona de filme.

## Recomandări

Recomandările sunt generate pe baza istoricului utilizatorului. Sistemul ține cont de preferințe precum categorii, ratinguri, popularitate și actori.

Pentru un cont nou, fără vizualizări, aplicația nu afișează recomandări artificiale. În schimb, utilizatorul primește un mesaj prin care este informat că trebuie să adauge câteva vizualizări înainte de generarea recomandărilor personalizate.

## Cont admin de test

Aplicația include un cont de admin definit în datele de seed:

```text
Email: nicholasstefan654@gmail.com
Parolă: real2016
Rol: ADMIN
