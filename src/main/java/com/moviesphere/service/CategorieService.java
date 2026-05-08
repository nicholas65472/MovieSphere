package com.moviesphere.service;

import com.moviesphere.repository.CategorieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategorieService {

    private final CategorieRepository categorieRepository;

    public List<Map<String, Object>> getAllCategorii() {
        return categorieRepository.getAllCategorii();
    }

    public Map<String, Object> getCategorieById(Integer id) {
        return categorieRepository.getCategorieById(id);
    }

    public List<Map<String, Object>> getFilmeByCategorie(Integer idCategorie) {
        return categorieRepository.getFilmeByCategorie(idCategorie);
    }

    public List<Map<String, Object>> getStatisticiCategorii() {
        return categorieRepository.getStatisticiCategorii();
    }
}