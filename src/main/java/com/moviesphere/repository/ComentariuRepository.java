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
public class ComentariuRepository {

    private final JdbcTemplate jdbc;

    public Integer adaugaComentariu(Integer idClient, Integer idFilm, String continut) {
        String sql = "SELECT fn_adauga_comentariu(?, ?, ?)";
        try {
            return jdbc.queryForObject(sql, Integer.class, idClient, idFilm, continut);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public void adaugaOptiuni(Integer idComentariu, List<Integer> idOptiuni) {
        String sql = "INSERT INTO optiuni_selectate(id_comentariu, id_optiune) " +
                "VALUES (?, ?) ON CONFLICT DO NOTHING";
        for (Integer idOptiune : idOptiuni) {
            jdbc.update(sql, idComentariu, idOptiune);
        }
    }

    public List<Map<String, Object>> getOptiuniPredefinite() {
        String sql = "SELECT id, cod, eticheta, tip FROM optiuni_predefinite ORDER BY tip, eticheta";
        return jdbc.queryForList(sql);
    }

    public void adaugaComentariuActor(Integer idClient, Integer idActor,
                                      Integer idFilm, String continut) {
        String sql = "INSERT INTO comentarii_actori(id_client, id_actor, id_film, continut) " +
                "VALUES (?, ?, ?, ?)";
        try {
            jdbc.update(sql, idClient, idActor, idFilm, continut);
        } catch (DataAccessException ex) {
            throw parseException(ex);
        }
    }

    public List<Map<String, Object>> getComentariiClient(Integer idClient) {
        String sql = "SELECT cf.id, f.titlu, cf.continut, cf.sentiment, cf.data_comentariu, " +
                "STRING_AGG(op.eticheta, ', ') AS optiuni FROM comentarii_filme cf " +
                "JOIN filme f ON cf.id_film = f.id " +
                "LEFT JOIN optiuni_selectate os ON os.id_comentariu = cf.id " +
                "LEFT JOIN optiuni_predefinite op ON os.id_optiune = op.id " +
                "WHERE cf.id_client = ? GROUP BY cf.id, f.titlu, cf.continut, " +
                "cf.sentiment, cf.data_comentariu ORDER BY cf.data_comentariu DESC";
        return jdbc.queryForList(sql, idClient);
    }

    private RuntimeException parseException(DataAccessException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        log.error("Eroare BD comentariu: {}", msg);
        if (msg == null) return new MovieSphereException("EROARE_NECUNOSCUTA", "Eroare necunoscuta.");

        if (msg.contains("VIZUALIZARE_LIPSA"))
            return new ViewingNotFoundException(extractMessage(msg));
        if (msg.contains("CLIENT_INEXISTENT"))
            return new ClientNotFoundException(extractMessage(msg));

        return new MovieSphereException("EROARE_BD", msg);
    }

    private String extractMessage(String msg) {
        int idx = msg.indexOf(':');
        return idx >= 0 ? msg.substring(idx + 1).trim() : msg;
    }
}