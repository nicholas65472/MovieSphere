package com.moviesphere.repository;

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
public class VizualizareRepository {

    private final JdbcTemplate jdbc;

    public Integer adaugaVizualizare(Integer idClient, Integer idFilm,
                                     Integer idVersiune, Integer vot) {
        String sql = "SELECT fn_adauga_vizualizare(?, ?, ?, ?)";
        try {
            return jdbc.queryForObject(sql, Integer.class, idClient, idFilm, idVersiune, vot);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public void actualizeazaVot(Integer idClient, Integer idFilm, Integer vot) {
        String sql = "CALL pr_actualizeaza_vot(?, ?, ?)";
        try {
            jdbc.update(sql, idClient, idFilm, vot);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<Map<String, Object>> getVizualizariClient(Integer idClient) {
        String sql = "SELECT v.id, v.id_film, f.titlu, v.data_vizualizare, " +
                "v.vot, v.finalizata, vf.format, vf.limba FROM vizualizari v " +
                "JOIN filme f ON v.id_film = f.id LEFT JOIN versiuni_film vf ON v.id_versiune = vf.id " +
                "WHERE v.id_client = ? ORDER BY v.data_vizualizare DESC";
        return jdbc.queryForList(sql, idClient);
    }

    public void finalizeazaVizualizare(Integer idVizualizare) {
        String sql = "UPDATE vizualizari SET finalizata = TRUE WHERE id = ?";
        int rows = jdbc.update(sql, idVizualizare);
        if (rows == 0) {
            throw new ViewingNotFoundException("Vizualizarea cu id " + idVizualizare + " nu exista.");
        }
    }

    private RuntimeException parseException(DataAccessException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        log.error("Eroare BD vizualizare: {}", msg);
        if (msg == null) return new MovieSphereException("EROARE_NECUNOSCUTA", "Eroare necunoscuta.");

        if (msg.contains("CLIENT_INEXISTENT"))
            return new ClientNotFoundException(extractMessage(msg));
        if (msg.contains("FILM_INEXISTENT"))
            return new FilmNotFoundException(extractMessage(msg));
        if (msg.contains("VERSIUNE_INVALIDA"))
            return new VersiuneInvalidaException(extractMessage(msg));
        if (msg.contains("VOT_INVALID"))
            return new InvalidVoteException(extractMessage(msg));
        if (msg.contains("VIZUALIZARE_LIPSA"))
            return new ViewingNotFoundException(extractMessage(msg));

        return new MovieSphereException("EROARE_BD", msg);
    }

    private String extractMessage(String msg) {
        int idx = msg.indexOf(':');
        return idx >= 0 ? msg.substring(idx + 1).trim() : msg;
    }
}