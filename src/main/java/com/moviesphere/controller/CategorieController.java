package com.moviesphere.controller;

import com.moviesphere.dto.response.ApiResponse;
import com.moviesphere.service.CategorieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorii")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieService categorieService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllCategorii() {
        return ResponseEntity.ok(ApiResponse.ok(categorieService.getAllCategorii()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCategorieById(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(categorieService.getCategorieById(id)));
    }

    @GetMapping("/{id}/filme")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFilmeByCategorie(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(categorieService.getFilmeByCategorie(id)));
    }

    @GetMapping("/statistici")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStatistici() {
        return ResponseEntity.ok(ApiResponse.ok(categorieService.getStatisticiCategorii()));
    }
}