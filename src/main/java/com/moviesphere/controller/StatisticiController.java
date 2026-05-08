package com.moviesphere.controller;

import com.moviesphere.dto.response.ApiResponse;
import com.moviesphere.service.StatisticiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistici")
@RequiredArgsConstructor
public class StatisticiController {

    private final StatisticiService statisticiService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatisticiGenerale() {
        return ResponseEntity.ok(ApiResponse.ok(statisticiService.getStatisticiGenerale()));
    }

    @GetMapping("/sentimente")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSentimente() {
        return ResponseEntity.ok(ApiResponse.ok(statisticiService.getDistributieSentimente()));
    }

    @GetMapping("/top-clienti")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopClienti(
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(ApiResponse.ok(statisticiService.getTopClienti(limit)));
    }

    @GetMapping("/evolutie")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEvolutie() {
        return ResponseEntity.ok(ApiResponse.ok(statisticiService.getEvolutieVizualizari()));
    }

    @GetMapping("/filme-comentate")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFilmeComentate(
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(ApiResponse.ok(statisticiService.getFilmeCeleMaiComentate(limit)));
    }

    @GetMapping("/optiuni-bifate")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOptiuniBifate() {
        return ResponseEntity.ok(ApiResponse.ok(statisticiService.getTopOptiuniBifate()));
    }

    @GetMapping("/audit")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLog(
            @RequestParam(defaultValue = "50") Integer limit) {
        return ResponseEntity.ok(ApiResponse.ok(statisticiService.getAuditLog(limit)));
    }
}