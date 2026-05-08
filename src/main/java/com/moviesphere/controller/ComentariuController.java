package com.moviesphere.controller;

import com.moviesphere.dto.request.ComentariuRequest;
import com.moviesphere.dto.response.ApiResponse;
import com.moviesphere.service.ComentariuService;
import com.moviesphere.dto.request.ComentariuActorRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comentarii")
@RequiredArgsConstructor
public class ComentariuController {

    private final ComentariuService comentariuService;

    @PostMapping
    public ResponseEntity<ApiResponse<Integer>> adaugaComentariu(
            @Valid @RequestBody ComentariuRequest request) {
        Integer id = comentariuService.adaugaComentariu(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(id));
    }

    @GetMapping("/optiuni")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOptiuniPredefinite() {
        return ResponseEntity.ok(ApiResponse.ok(comentariuService.getOptiuniPredefinite()));
    }

    @GetMapping("/client/{idClient}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getComentariiClient(
            @PathVariable Integer idClient) {
        return ResponseEntity.ok(ApiResponse.ok(comentariuService.getComentariiClient(idClient)));
    }

    @PostMapping("/actor")
    public ResponseEntity<ApiResponse<Void>> adaugaComentariuActor(
            @Valid @RequestBody ComentariuActorRequest request) {
        comentariuService.adaugaComentariuActor(
                request.getIdClient(),
                request.getIdActor(),
                request.getIdFilm(),
                request.getContinut()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(null));
    }
}