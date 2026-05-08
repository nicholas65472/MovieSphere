package com.moviesphere.controller;

import com.moviesphere.dto.request.InregistrareClientRequest;
import com.moviesphere.dto.request.LoginRequest;
import com.moviesphere.dto.response.*;
import com.moviesphere.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clienti")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping("/inregistrare")
    public ResponseEntity<ApiResponse<Integer>> inregistrare(
            @Valid @RequestBody InregistrareClientRequest request) {
        Integer id = clientService.inregistrareClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(id));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = clientService.autentificare(request);
        return ResponseEntity.ok(ApiResponse.ok("Autentificare reusita", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> totiClientii() {
        return ResponseEntity.ok(ApiResponse.ok(clientService.totiClientii()));
    }

    @GetMapping("/{id}/profil")
    public ResponseEntity<ApiResponse<List<ProfilCategorieResponse>>> profilClient(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.profilClient(id)));
    }

    @GetMapping("/{id}/istoric")
    public ResponseEntity<ApiResponse<List<IstoricResponse>>> istoricClient(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.istoricClient(id)));
    }

    @GetMapping("/{id}/actori-frecventi")
    public ResponseEntity<ApiResponse<List<ActoriFrecventiResponse>>> actoriFrecventi(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "10") Integer numar) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.actoriFrecventi(id, numar)));
    }

    @GetMapping("/{id}/similari")
    public ResponseEntity<ApiResponse<List<ClientSimilarResponse>>> clientiSimilari(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "5") Integer numar) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.clientiSimilari(id, numar)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> dezactiveazaClient(@PathVariable Integer id) {
        clientService.dezactiveazaClient(id);
        return ResponseEntity.ok(ApiResponse.ok("Client dezactivat cu succes", null));
    }
}