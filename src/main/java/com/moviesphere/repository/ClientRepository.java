package com.moviesphere.repository;

import com.moviesphere.dto.response.IstoricResponse;
import com.moviesphere.dto.response.LoginResponse;
import com.moviesphere.dto.response.ProfilCategorieResponse;
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

    public LoginResponse autentificareParola(String email, String parolaRaw, PasswordEncoder passwordEncoder) {
        String sql = "SELECT id, nume, prenume, email, oras, parola_hash, activ FROM clienti " +
                "WHERE email = ?";

        try {
            List<Map<String, Object>> rezultat = jdbc.queryForList(sql, email);

            if (rezultat.isEmpty()) {
                throw new AuthenticationException("EMAIL_INEXISTENT",
                        "Nu exista un cont pentru adresa " + email);
            }

            Map<String, Object> client = rezultat.get(0);

            Boolean activ = (Boolean) client.get("activ");
            if (activ == null || !activ) {
                throw new AuthenticationException("CONT_INACTIV",
                        "Contul asociat adresei " + email + " este inactiv."
                );
            }

            String hashDinBD = (String) client.get("parola_hash");

            if (!passwordEncoder.matches(parolaRaw, hashDinBD)) {
                throw new AuthenticationException("PAROLA_INCORECTA",
                        "Parola introdusa este incorecta."
                );
            }

            LoginResponse response = new LoginResponse();
            response.setId((Integer) client.get("id"));
            response.setNume((String) client.get("nume"));
            response.setPrenume((String) client.get("prenume"));
            response.setEmail((String) client.get("email"));
            response.setOras((String) client.get("oras"));

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
        String sql = "SELECT id_film, titlu, categorie, data_vizualizare, vot, comentariu, sentiment " +
                "FROM fn_istoric_client(?)";

        try {
            return jdbc.query(sql, (rs, i) -> {
                IstoricResponse r = new IstoricResponse();
                r.setIdFilm(rs.getInt("id_film"));
                r.setTitlu(rs.getString("titlu"));
                r.setCategorie(rs.getString("categorie"));
                r.setDataVizualizare(rs.getTimestamp("data_vizualizare") != null
                        ? rs.getTimestamp("data_vizualizare").toLocalDateTime()
                        : null);
                r.setVot(rs.getObject("vot") != null ? rs.getInt("vot") : null);
                r.setComentariu(rs.getString("comentariu"));
                r.setSentiment(rs.getString("sentiment"));
                return r;
            }, idClient);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<Map<String, Object>> totiClientii() {
        String sql = "SELECT id, nume, prenume, email, telefon, oras, data_inregistrare, activ " +
                "FROM clienti ORDER BY data_inregistrare DESC";

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
        log.error("Eroare BD: {}", msg);

        if (msg == null) {
            return new MovieSphereException("EROARE_NECUNOSCUTA", "Eroare necunoscuta.");
        }

        if (msg.contains("EMAIL_EXISTENT")) {
            return new EmailAlreadyExistsException(extractMessage(msg));
        }

        if (msg.contains("CLIENT_INEXISTENT")) {
            return new ClientNotFoundException(extractMessage(msg));
        }

        if (msg.contains("FILM_INEXISTENT")) {
            return new FilmNotFoundException(extractMessage(msg));
        }

        if (msg.contains("VOT_INVALID")) {
            return new InvalidVoteException(extractMessage(msg));
        }

        if (msg.contains("VIZUALIZARE_LIPSA")) {
            return new ViewingNotFoundException(extractMessage(msg));
        }

        if (msg.contains("EMAIL_INEXISTENT") || msg.contains("PAROLA_INCORECTA")) {
            return new AuthenticationException(extractCode(msg), extractMessage(msg));
        }

        return new MovieSphereException("EROARE_BD", msg);
    }

    private String extractMessage(String msg) {
        int idx = msg.indexOf(':');
        return idx >= 0 ? msg.substring(idx + 1).trim() : msg;
    }

    private String extractCode(String msg) {
        int idx = msg.indexOf(':');
        return idx >= 0 ? msg.substring(0, idx).trim() : "EROARE";
    }
}