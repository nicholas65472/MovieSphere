package com.moviesphere.service;

import com.moviesphere.dto.response.*;
import com.moviesphere.repository.FilmRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FilmService {

    private final FilmRepository filmRepository;

    public List<Map<String, Object>> getAllFilme() {
        return filmRepository.getAllFilme();
    }

    public Map<String, Object> getFilmById(Integer id) {
        return filmRepository.getFilmById(id);
    }

    public List<Map<String, Object>> getVersiuniFilm(Integer idFilm) {
        return filmRepository.getVersiuniFilm(idFilm);
    }

    public List<Map<String, Object>> getDistributieFilm(Integer idFilm) {
        return filmRepository.getDistributieFilm(idFilm);
    }

    public List<TopFilmResponse> topFilme(Integer idCategorie, Integer numar) {
        int n = (numar != null && numar > 0) ? numar : 10;
        log.info("Top {} filme, categorie={}", n, idCategorie);
        return filmRepository.topFilme(idCategorie, n);
    }

    public List<RecomandareResponse> genereazaRecomandari(Integer idClient, Integer numarMax) {
        int n = (numarMax != null && numarMax > 0) ? numarMax : 10;
        log.info("Generare {} recomandari pentru client id={}", n, idClient);
        return filmRepository.genereazaRecomandari(idClient, n);
    }

    public List<StatisticiSezonResponse> statisticiSezoniere(Integer idFilm) {
        log.info("Statistici sezoniere, film id={}", idFilm);
        return filmRepository.statisticiSezoniere(idFilm);
    }

    public List<PredictieSezonResponse> predictiiSezoniere(String sezon, Integer numarMax) {
        int n = (numarMax != null && numarMax > 0) ? numarMax : 10;
        log.info("Predictii sezoniere: sezon={}, max={}", sezon, n);
        return filmRepository.predictiiSezoniere(sezon, n);
    }

    public List<Map<String, Object>> getComentariiFilm(Integer idFilm) {
        return filmRepository.getComentariiFilm(idFilm);
    }

    public List<Map<String, Object>> cautaFilme(String query) {
        if (query == null || query.trim().isEmpty()) return List.of();
        log.info("Cautare filme: '{}'", query);
        return filmRepository.cautaFilme(query.trim());
    }
}