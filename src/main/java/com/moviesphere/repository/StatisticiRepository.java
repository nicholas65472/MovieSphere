package com.moviesphere.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class StatisticiRepository {

    private final JdbcTemplate jdbc;

    public List<Map<String, Object>> getAuditLog(Integer limit) {
        String sql = "SELECT id, tabel_nume, operatie, id_rand, detalii, data_op " +
                "FROM audit_log ORDER BY data_op DESC LIMIT ?";
        return jdbc.queryForList(sql, limit);
    }

    public Map<String, Object> getStatisticiGenerale() {
        String sql = "SELECT (SELECT COUNT(*) FROM clienti WHERE activ = TRUE) AS clienti_activi, " +
                "(SELECT COUNT(*) FROM filme WHERE activ = TRUE) AS filme_active, " +
                "(SELECT COUNT(*) FROM vizualizari) AS vizualizari_totale, " +
                "(SELECT COUNT(*) FROM comentarii_filme) AS comentarii_totale, " +
                "(SELECT COUNT(*) FROM vizualizari WHERE vot IS NOT NULL) AS voturi_totale, " +
                "(SELECT ROUND(AVG(vot)::NUMERIC, 2) " +
                "FROM vizualizari WHERE vot IS NOT NULL) AS rating_mediu_global, " +
                "(SELECT COUNT(*) FROM vizualizari WHERE finalizata = TRUE)  AS vizionari_complete";
        return jdbc.queryForMap(sql);
    }

    public List<Map<String, Object>> getDistributieSentimente() {
        String sql = "SELECT sentiment, COUNT(*) AS numar_comentarii, ROUND(COUNT(*)::NUMERIC / " +
                "NULLIF((SELECT COUNT(*) FROM comentarii_filme " +
                "WHERE sentiment IS NOT NULL), 0) * 100, 1) AS procent FROM comentarii_filme " +
                "WHERE sentiment IS NOT NULL GROUP BY sentiment ORDER BY numar_comentarii DESC";
        return jdbc.queryForList(sql);
    }

    public List<Map<String, Object>> getTopClienti(Integer limit) {
        String sql = "SELECT c.prenume || ' ' || c.nume AS client, c.oras, COUNT(v.id) AS numar_vizualizari, " +
                "COUNT(v.vot) AS voturi_acordate, ROUND(AVG(v.vot)::NUMERIC, 2) AS rating_mediu_acordat FROM clienti c " +
                "JOIN vizualizari v ON v.id_client = c.id WHERE c.activ = TRUE GROUP BY c.id, c.prenume, c.nume, c.oras " +
                "ORDER BY numar_vizualizari DESC LIMIT ?";
        return jdbc.queryForList(sql, limit);
    }

    public List<Map<String, Object>> getEvolutieVizualizari() {
        String sql = "SELECT TO_CHAR(data_vizualizare, 'YYYY-MM') AS luna, COUNT(*) AS numar_vizualizari, " +
                "COUNT(DISTINCT id_client) AS clienti_unici, ROUND(AVG(vot)::NUMERIC, 2) AS rating_mediu " +
                "FROM vizualizari WHERE data_vizualizare >= NOW() - INTERVAL '12 months' " +
                "GROUP BY TO_CHAR(data_vizualizare, 'YYYY-MM') ORDER BY luna";
        return jdbc.queryForList(sql);
    }

    public List<Map<String, Object>> getFilmeCeleMaiComentate(Integer limit) {
        String sql = "SELECT f.titlu, c.nume AS categorie, COUNT(cf.id)                                              AS total_comentarii, " +
                "COUNT(CASE WHEN cf.sentiment = 'pozitiv' THEN 1 END) AS pozitive, " +
                "COUNT(CASE WHEN cf.sentiment = 'negativ' THEN 1 END) AS negative, " +
                "COUNT(CASE WHEN cf.sentiment = 'neutru'  THEN 1 END) AS neutre " +
                "FROM filme f JOIN categorii c ON f.id_categorie = c.id JOIN comentarii_filme cf ON cf.id_film = f.id " +
                "GROUP BY f.id, f.titlu, c.nume ORDER BY total_comentarii DESC LIMIT ?";
        return jdbc.queryForList(sql, limit);
    }

    public List<Map<String, Object>> getTopOptiuniBifate() {
        String sql = "SELECT op.eticheta, op.tip, COUNT(os.id) AS de_cate_ori_bifata FROM optiuni_predefinite op " +
                "LEFT JOIN optiuni_selectate os ON os.id_optiune = op.id GROUP BY op.id, op.eticheta, op.tip " +
                "ORDER BY de_cate_ori_bifata DESC";
        return jdbc.queryForList(sql);
    }
}