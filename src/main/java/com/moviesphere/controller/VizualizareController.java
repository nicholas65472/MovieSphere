package com.moviesphere.controller;

import com.moviesphere.dto.request.ActualizeazaVotRequest;
import com.moviesphere.dto.request.VizualizareRequest;
import com.moviesphere.dto.response.ApiResponse;
import com.moviesphere.service.VizualizareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vizualizari")
@RequiredArgsConstructor
public class VizualizareController {

    private final VizualizareService vizualizareService;

    @PostMapping
    public ResponseEntity<ApiResponse<Integer>> adaugaVizualizare(
            @Valid @RequestBody VizualizareRequest request) {
        Integer id = vizualizareService.adaugaVizualizare(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(id));
    }

    @PutMapping("/vot")
    public ResponseEntity<ApiResponse<Void>> actualizeazaVot(
            @Valid @RequestBody ActualizeazaVotRequest request) {
        vizualizareService.actualizeazaVot(request);
        return ResponseEntity.ok(ApiResponse.ok("Vot actualizat cu succes", null));
    }

    @GetMapping("/client/{idClient}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVizualizariClient(
            @PathVariable Integer idClient) {
        return ResponseEntity.ok(ApiResponse.ok(vizualizareService.getVizualizariClient(idClient)));
    }

    @PutMapping("/{id}/finalizeaza")
    public ResponseEntity<ApiResponse<Void>> finalizeazaVizualizare(
            @PathVariable Integer id) {
        vizualizareService.finalizeazaVizualizare(id);
        return ResponseEntity.ok(ApiResponse.ok("Vizualizare finalizata", null));
    }
}