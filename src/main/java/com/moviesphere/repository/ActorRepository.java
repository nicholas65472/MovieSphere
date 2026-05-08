package com.moviesphere.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class ActorRepository {

    private final JdbcTemplate jdbc;

    public List<Map<String, Object>> getAllActori() {
        String sql = "SELECT id, nume_scena, prenume, nume_familie, data_nasterii, nationalitate " +
                "FROM actori ORDER BY nume_scena";
        return jdbc.queryForList(sql);
    }

    public Map<String, Object> getActorById(Integer id) {
        String sql = "SELECT a.id, a.nume_scena, a.prenume, a.nume_familie, " +
                "a.data_nasterii, a.nationalitate, a.biografie FROM actori a WHERE a.id = ? ";
        List<Map<String, Object>> r = jdbc.queryForList(sql, id);
        if (r.isEmpty()) throw new com.moviesphere.exception.MovieSphereException(
                "ACTOR_INEXISTENT", "Actorul cu id " + id + " nu exista.");
        return r.get(0);
    }

    public List<Map<String, Object>> getFilmeActor(Integer idActor) {
        String sql = "SELECT f.id, f.titlu, f.rating, f.poster_url, " +
                "d.rol, d.tip_rol, c.nume AS categorie FROM distributie d " +
                "JOIN filme f ON d.id_film = f.id JOIN categorii c ON f.id_categorie = c.id " +
                "WHERE d.id_actor = ? AND f.activ = TRUE ORDER BY f.data_lansarii DESC ";
        return jdbc.queryForList(sql, idActor);
    }


    public List<Map<String, Object>> getComentariiActor(Integer idActor) {
        String sql = "SELECT ca.continut, ca.data_comentariu, cl.prenume || ' ' || cl.nume AS autor, " +
                "f.titlu AS film FROM comentarii_actori ca JOIN clienti cl ON ca.id_client = cl.id " +
                "LEFT JOIN filme f ON ca.id_film = f.id WHERE ca.id_actor = ? " +
                "ORDER BY ca.data_comentariu DESC";
        return jdbc.queryForList(sql, idActor);
    }
}