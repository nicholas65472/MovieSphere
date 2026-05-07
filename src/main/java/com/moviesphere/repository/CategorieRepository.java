package com.moviesphere.repository;

import com.moviesphere.exception.MovieSphereException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Repository pentru categorii de filme.
 */
@Repository
@RequiredArgsConstructor
public class CategorieRepository {

    private final JdbcTemplate jdbc;

    public List<Map<String, Object>> getAllCategorii() {
        String sql = "SELECT c.id, c.nume, c.descriere, COUNT(f.id) AS numar_filme FROM categorii c " +
                "LEFT JOIN filme f ON f.id_categorie = c.id AND f.activ = TRUE " +
                "GROUP BY c.id, c.nume, c.descriere ORDER BY c.nume ";
        return jdbc.queryForList(sql);
    }

    public Map<String, Object> getCategorieById(Integer id) {
        String sql = "SELECT c.id, c.nume, c.descriere, COUNT(f.id) AS numar_filme FROM categorii c " +
                "LEFT JOIN filme f ON f.id_categorie = c.id AND f.activ = TRUE WHERE c.id = ? " +
                "GROUP BY c.id, c.nume, c.descriere";
        List<Map<String, Object>> result = jdbc.queryForList(sql, id);
        if (result.isEmpty()) {
            throw new MovieSphereException("CATEGORIE_INEXISTENTA",
                    "Categoria cu id " + id + " nu exista.");
        }
        return result.get(0);
    }


    public List<Map<String, Object>> getFilmeByCategorie(Integer idCategorie) {
        String sql = " SELECT f.id, f.titlu, f.descriere, f.data_lansarii," +
                "f.durata_minute, f.rating, f.numar_voturi, f.poster_url FROM filme f " +
                "WHERE f.id_categorie = ? AND f.activ = TRUE ORDER BY f.rating DESC ";
        return jdbc.queryForList(sql, idCategorie);
    }

    public List<Map<String, Object>> getStatisticiCategorii() {
        String sql = "SELECT c.nume AS categorie, COUNT(DISTINCT f.id)  AS numar_filme, " +
                "COUNT(v.id) AS total_vizualizari, ROUND(AVG(v.vot)::NUMERIC, 2) AS rating_mediu " +
                "FROM categorii c LEFT JOIN filme f ON f.id_categorie = c.id AND f.activ = TRUE " +
                "LEFT JOIN vizualizari v ON v.id_film = f.id GROUP BY c.id, c.nume " +
                "ORDER BY total_vizualizari DESC NULLS LAST";
        return jdbc.queryForList(sql);
    }
}