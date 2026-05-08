package com.moviesphere.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HealthService {

    private final JdbcTemplate jdbc;

    public Map<String, Object> getHealthInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("status", "UP");
        info.put("timestamp", LocalDateTime.now().toString());
        info.put("aplicatie", "MovieSphere API");
        info.put("versiune", "1.0.0");

        try {
            String dbVersion = jdbc.queryForObject("SELECT version()", String.class);
            info.put("database", "UP");
            info.put("dbVersion", dbVersion != null
                    ? dbVersion.substring(0, Math.min(dbVersion.length(), 30))
                    : "unknown");

            Integer numarTabele = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables " +
                            "WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
                    Integer.class
            );
            info.put("numarTabele", numarTabele);
        } catch (Exception e) {
            info.put("database", "DOWN");
            info.put("dbError", e.getMessage());
            info.put("status", "DEGRADED");
        }

        return info;
    }
}