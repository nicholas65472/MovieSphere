package com.moviesphere.service;

import com.moviesphere.repository.StatisticiRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticiService {

    private final StatisticiRepository statisticiRepository;

    public List<Map<String, Object>> getAuditLog(Integer limit) {
        int l = (limit != null && limit > 0) ? limit : 50;
        return statisticiRepository.getAuditLog(l);
    }

    public Map<String, Object> getStatisticiGenerale() {
        return statisticiRepository.getStatisticiGenerale();
    }

    public List<Map<String, Object>> getDistributieSentimente() {
        return statisticiRepository.getDistributieSentimente();
    }

    public List<Map<String, Object>> getTopClienti(Integer limit) {
        int l = (limit != null && limit > 0) ? limit : 10;
        return statisticiRepository.getTopClienti(l);
    }

    public List<Map<String, Object>> getEvolutieVizualizari() {
        return statisticiRepository.getEvolutieVizualizari();
    }
        
    public List<Map<String, Object>> getFilmeCeleMaiComentate(Integer limit) {
        int l = (limit != null && limit > 0) ? limit : 10;
        return statisticiRepository.getFilmeCeleMaiComentate(l);
    }

    public List<Map<String, Object>> getTopOptiuniBifate() {
        return statisticiRepository.getTopOptiuniBifate();
    }
}