package com.moviesphere.repository;

import com.moviesphere.dto.response.*;
import com.moviesphere.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
@Slf4j
public class ClientRepository {

    private final JdbcTemplate jdbc;

    public Integer inregistrareClient(String nume, String prenume, String email,
                                      String parolaHash, String telefon, String oras) {
        String sql = "SELECT fn_inregistrare_client(?, ?, ?, ?, ?, ?)";
        try {
            return jdbc.queryForObject(sql, Integer.class,
                    nume, prenume, email, parolaHash, telefon, oras);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public LoginResponse autentificareParola(String email, String parolaRaw,
                                             PasswordEncoder passwordEncoder) {
        String sql = "SELECT id, nume, prenume, email, oras, rol, parola_hash, activ FROM clienti WHERE email = ?";
        try {
            List<Map<String, Object>> rezultat = jdbc.queryForList(sql, email);

            if (rezultat.isEmpty()) {
                throw new AuthenticationException("EMAIL_INEXISTENT",
                        "Nu exista un cont pentru adresa " + email);
            }

            Map<String, Object> client = rezultat.getFirst();
            Boolean activ = (Boolean) client.get("activ");
            if (activ == null || !activ) {
                throw new AuthenticationException("CONT_INACTIV",
                        "Contul asociat adresei " + email + " este inactiv.");
            }

            String hashDinBD = (String) client.get("parola_hash");
            if (!passwordEncoder.matches(parolaRaw, hashDinBD)) {
                throw new AuthenticationException("PAROLA_INCORECTA",
                        "Parola introdusa este incorecta.");
            }

            LoginResponse response = new LoginResponse();
            response.setId((Integer) client.get("id"));
            response.setNume((String) client.get("nume"));
            response.setPrenume((String) client.get("prenume"));
            response.setEmail((String) client.get("email"));
            response.setOras((String) client.get("oras"));
            response.setRol((String) client.get("rol"));
            return response;

        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<ProfilCategorieResponse> profilClient(Integer idClient) {
        String sql = "SELECT categorie, numar_vizualizari, rating_mediu, procent FROM fn_profil_client(?)";
        try {
            return jdbc.query(sql, (rs, i) -> {
                ProfilCategorieResponse r = new ProfilCategorieResponse();
                r.setCategorie(rs.getString("categorie"));
                r.setNumarVizualizari(rs.getLong("numar_vizualizari"));
                r.setRatingMediu(rs.getBigDecimal("rating_mediu"));
                r.setProcent(rs.getBigDecimal("procent"));
                return r;
            }, idClient);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<IstoricResponse> istoricClient(Integer idClient) {
        String sql = "SELECT id_film, titlu, categorie, data_vizualizare, vot, " +
                "comentariu, sentiment FROM fn_istoric_client(?)";
        try {
            return jdbc.query(sql, (rs, i) -> {
                IstoricResponse r = new IstoricResponse();
                r.setIdFilm(rs.getInt("id_film"));
                r.setTitlu(rs.getString("titlu"));
                r.setCategorie(rs.getString("categorie"));
                r.setDataVizualizare(rs.getTimestamp("data_vizualizare") != null
                        ? rs.getTimestamp("data_vizualizare").toLocalDateTime() : null);
                r.setVot(rs.getObject("vot") != null ? rs.getInt("vot") : null);
                r.setComentariu(rs.getString("comentariu"));
                r.setSentiment(rs.getString("sentiment"));
                return r;
            }, idClient);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<ActoriFrecventiResponse> actoriFrecventi(Integer idClient, Integer numarMax) {
        String sql = "SELECT id_actor, nume_scena, nationalitate, numar_aparitii, " +
                "rating_mediu, tip_rol_frecvent FROM fn_actori_frecventi(?, ?)";
        try {
            return jdbc.query(sql, (rs, i) -> {
                ActoriFrecventiResponse r = new ActoriFrecventiResponse();
                r.setIdActor(rs.getInt("id_actor"));
                r.setNumeScena(rs.getString("nume_scena"));
                r.setNationalitate(rs.getString("nationalitate"));
                r.setNumarAparitii(rs.getLong("numar_aparitii"));
                r.setRatingMediu(rs.getBigDecimal("rating_mediu"));
                r.setTipRolFrecvent(rs.getString("tip_rol_frecvent"));
                return r;
            }, idClient, numarMax);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<ClientSimilarResponse> clientiSimilari(Integer idClient, Integer numarMax) {
        String sql = "SELECT id_client_similar, nume_complet, oras, scor_similaritate, " +
                "categorii_comune, actori_comuni, motiv FROM fn_clienti_similari(?, ?)";
        try {
            return jdbc.query(sql, (rs, i) -> {
                ClientSimilarResponse r = new ClientSimilarResponse();
                r.setIdClientSimilar(rs.getInt("id_client_similar"));
                r.setNumeComplet(rs.getString("nume_complet"));
                r.setOras(rs.getString("oras"));
                r.setScorSimilaritate(rs.getBigDecimal("scor_similaritate"));
                r.setCategoriiComune(rs.getLong("categorii_comune"));
                r.setActoriComuni(rs.getLong("actori_comuni"));
                r.setMotiv(rs.getString("motiv"));
                return r;
            }, idClient, numarMax);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<Map<String, Object>> totiClientii() {
        String sql = "SELECT id, nume, prenume, email, telefon, oras, rol, data_inregistrare, activ FROM clienti " +
                "ORDER BY data_inregistrare DESC";
        return jdbc.queryForList(sql);
    }

    public void dezactiveazaClient(Integer id) {
        String sql = "UPDATE clienti SET activ = FALSE WHERE id = ?";
        int rows = jdbc.update(sql, id);
        if (rows == 0) {
            throw new ClientNotFoundException("Clientul cu id " + id + " nu exista.");
        }
    }

    private RuntimeException parseException(DataAccessException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        log.error("Eroare BD client: {}", msg);
        if (msg == null)
            return new MovieSphereException("EROARE_NECUNOSCUTA", "Eroare necunoscuta.");
        if (msg.contains("EMAIL_EXISTENT"))
            return new EmailAlreadyExistsException(extractMessage(msg));
        if (msg.contains("CLIENT_INEXISTENT"))
            return new ClientNotFoundException(extractMessage(msg));
        if (msg.contains("FILM_INEXISTENT"))
            return new FilmNotFoundException(extractMessage(msg));
        if (msg.contains("VOT_INVALID"))
            return new InvalidVoteException(extractMessage(msg));
        if (msg.contains("VIZUALIZARE_LIPSA"))
            return new ViewingNotFoundException(extractMessage(msg));
        return new MovieSphereException("EROARE_BD", msg);
    }

    private String extractMessage(String msg) {
        int idx = msg.indexOf(':');
        String clean = idx >= 0 ? msg.substring(idx + 1) : msg;
        int lineBreak = clean.indexOf('\n');
        if (lineBreak >= 0) {
            clean = clean.substring(0, lineBreak);
        }
        return clean.trim();
    }
}
