package com.moviesphere.controller;

import com.moviesphere.dto.response.ApiResponse;
import com.moviesphere.service.ActorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/actori")
@RequiredArgsConstructor
public class ActorController {

    private final ActorService actorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllActori() {
        return ResponseEntity.ok(ApiResponse.ok(actorService.getAllActori()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getActorById(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(actorService.getActorById(id)));
    }

    @GetMapping("/{id}/filme")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFilmeActor(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(actorService.getFilmeActor(id)));
    }

    @GetMapping("/{id}/comentarii")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getComentariiActor(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(actorService.getComentariiActor(id)));
    }
}