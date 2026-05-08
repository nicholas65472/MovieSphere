package com.moviesphere.controller;

import com.moviesphere.dto.response.*;
import com.moviesphere.service.FilmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/filme")
@RequiredArgsConstructor
public class FilmController {

    private final FilmService filmService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllFilme(
            @RequestParam(required = false) String q) {
        if (q != null && !q.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(filmService.cautaFilme(q)));
        }
        return ResponseEntity.ok(ApiResponse.ok(filmService.getAllFilme()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFilmById(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(filmService.getFilmById(id)));
    }

    @GetMapping("/{id}/versiuni")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVersiuni(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(filmService.getVersiuniFilm(id)));
    }

    @GetMapping("/{id}/distributie")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDistributie(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(filmService.getDistributieFilm(id)));
    }

    @GetMapping("/{id}/comentarii")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getComentarii(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(filmService.getComentariiFilm(id)));
    }

    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<TopFilmResponse>>> topFilme(
            @RequestParam(required = false) Integer categorie,
            @RequestParam(defaultValue = "10") Integer numar) {
        return ResponseEntity.ok(ApiResponse.ok(filmService.topFilme(categorie, numar)));
    }

    @GetMapping("/recomandari/{idClient}")
    public ResponseEntity<ApiResponse<List<RecomandareResponse>>> recomandari(
            @PathVariable Integer idClient,
            @RequestParam(defaultValue = "10") Integer numar) {
        return ResponseEntity.ok(ApiResponse.ok(filmService.genereazaRecomandari(idClient, numar)));
    }

    @GetMapping("/statistici/sezoniere")
    public ResponseEntity<ApiResponse<List<StatisticiSezonResponse>>> statisticiSezoniere(
            @RequestParam(required = false) Integer idFilm) {
        return ResponseEntity.ok(ApiResponse.ok(filmService.statisticiSezoniere(idFilm)));
    }

    @GetMapping("/predictii")
    public ResponseEntity<ApiResponse<List<PredictieSezonResponse>>> predictiiSezoniere(
            @RequestParam String sezon,
            @RequestParam(defaultValue = "10") Integer numar) {
        return ResponseEntity.ok(ApiResponse.ok(filmService.predictiiSezoniere(sezon, numar)));
    }
}