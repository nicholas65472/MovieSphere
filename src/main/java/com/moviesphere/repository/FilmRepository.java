package com.moviesphere.repository;

import com.moviesphere.dto.response.RecomandareResponse;
import com.moviesphere.dto.response.StatisticiSezonResponse;
import com.moviesphere.dto.response.TopFilmResponse;
import com.moviesphere.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
@Slf4j
public class FilmRepository {

    private final JdbcTemplate jdbc;

    public List<Map<String, Object>> getAllFilme() {
        String sql = "SELECT f.id, f.titlu, f.descriere, f.data_lansarii, f.durata_minute, " +
                "f.rating, f.numar_voturi, f.poster_url, c.nume AS categorie " +
                "FROM filme f  JOIN categorii c ON f.id_categorie = c.id WHERE f.activ = TRUE" +
                "ORDER BY f.rating DESC";
        return jdbc.queryForList(sql);
    }


    public Map<String, Object> getFilmById(Integer id) {
        String sql = "SELECT f.id, f.titlu, f.descriere, f.data_lansarii, " +
                "f.durata_minute,f.rating, f.numar_voturi, f.poster_url, " +
                "c.id AS id_categorie, c.nume AS categorie FROM filme f " +
                "JOIN categorii c ON f.id_categorie = c.id WHERE f.id = ? AND f.activ = TRUE";
        List<Map<String, Object>> rezultat = jdbc.queryForList(sql, id);
        if (rezultat.isEmpty()) {
            throw new FilmNotFoundException("Filmul cu id " + id + " nu exista sau nu este activ.");
        }
        return rezultat.get(0);
    }

    public List<Map<String, Object>> getVersiuniFilm(Integer idFilm) {
        String sql = "SELECT id, format, rezolutie, limba, subtitrare FROM versiuni_film WHERE id_film = ?";
        return jdbc.queryForList(sql, idFilm);
    }

    public List<Map<String, Object>> getDistributieFilm(Integer idFilm) {
        String sql = "SELECT a.id, a.nume_scena, a.prenume, a.nume_familie, d.rol, d.tip_rol " +
                "FROM distributie d JOIN actori a ON d.id_actor = a.id WHERE d.id_film = ? " +
                "ORDER BY d.tip_rol";
        return jdbc.queryForList(sql, idFilm);
    }


    public List<TopFilmResponse> topFilme(Integer idCategorie, Integer numar) {
        String sql = "SELECT id_film, titlu, categorie, rating, numar_voturi, numar_vizualizari " +
                "FROM fn_top_filme(?, ?)";
        try {
            return jdbc.query(sql, (rs, i) -> {
                TopFilmResponse r = new TopFilmResponse();
                r.setIdFilm(rs.getInt("id_film"));
                r.setTitlu(rs.getString("titlu"));
                r.setCategorie(rs.getString("categorie"));
                r.setRating(rs.getBigDecimal("rating"));
                r.setNumarVoturi(rs.getInt("numar_voturi"));
                r.setNumarVizualizari(rs.getLong("numar_vizualizari"));
                return r;
            }, idCategorie, numar);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<RecomandareResponse> genereazaRecomandari(Integer idClient, Integer numarMax) {
        String sql = "SELECT id_film, titlu, categorie, rating, scor_final, motiv" +
                "FROM fn_genereaza_recomandari(?, ?)";
        try {
            return jdbc.query(sql, (rs, i) -> {
                RecomandareResponse r = new RecomandareResponse();
                r.setIdFilm(rs.getInt("id_film"));
                r.setTitlu(rs.getString("titlu"));
                r.setCategorie(rs.getString("categorie"));
                r.setRating(rs.getBigDecimal("rating"));
                r.setScorFinal(rs.getBigDecimal("scor_final"));
                r.setMotiv(rs.getString("motiv"));
                return r;
            }, idClient, numarMax);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<StatisticiSezonResponse> statisticiSezoniere(Integer idFilm) {
        String sql = "SELECT sezon, numar_vizualizari, rating_mediu, titlu_film" +
                "FROM fn_statistici_sezoniere(?)";
        try {
            return jdbc.query(sql, (rs, i) -> {
                StatisticiSezonResponse r = new StatisticiSezonResponse();
                r.setSezon(rs.getString("sezon"));
                r.setNumarVizualizari(rs.getLong("numar_vizualizari"));
                r.setRatingMediu(rs.getBigDecimal("rating_mediu"));
                r.setTitluFilm(rs.getString("titlu_film"));
                return r;
            }, idFilm);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<Map<String, Object>> getComentariiFilm(Integer idFilm) {
        String sql = "SELECT cf.id, c.prenume || ' ' || c.nume AS autor, cf.continut, cf.sentiment, " +
                "cf.data_comentariu FROM comentarii_filme cf JOIN clienti c ON cf.id_client = c.id " +
                "WHERE cf.id_film = ? ORDER BY cf.data_comentariu DESC";
        return jdbc.queryForList(sql, idFilm);
    }

    public List<Map<String, Object>> cautaFilme(String query) {
        String sql = "SELECT f.id, f.titlu, f.rating, f.poster_url, c.nume AS categorie FROM filme f " +
                "JOIN categorii c ON f.id_categorie = c.id WHERE f.activ = TRUE AND f.titlu ILIKE ? " +
                "ORDER BY f.rating DESC LIMIT 20";
        return jdbc.queryForList(sql, "%" + query + "%");
    }

    private RuntimeException parseException(DataAccessException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        log.error("Eroare BD: {}", msg);
        if (msg == null) return new MovieSphereException("EROARE_NECUNOSCUTA", "Eroare necunoscuta.");
        if (msg.contains("CLIENT_INEXISTENT"))
            return new ClientNotFoundException(extractMessage(msg));
        if (msg.contains("FILM_INEXISTENT"))
            return new FilmNotFoundException(extractMessage(msg));
        return new MovieSphereException("EROARE_BD", msg);
    }

    private String extractMessage(String msg) {
        int idx = msg.indexOf(':');
        return idx >= 0 ? msg.substring(idx + 1).trim() : msg;
    }
}