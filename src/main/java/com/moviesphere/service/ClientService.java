package com.moviesphere.service;

import com.moviesphere.dto.request.InregistrareClientRequest;
import com.moviesphere.dto.request.LoginRequest;
import com.moviesphere.dto.response.*;
import com.moviesphere.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public Integer inregistrareClient(InregistrareClientRequest request) {
        String parolaHash = passwordEncoder.encode(request.getParola());
        log.info("Inregistrare client nou: {}", request.getEmail());
        return clientRepository.inregistrareClient(
                request.getNume(), request.getPrenume(), request.getEmail(),
                parolaHash, request.getTelefon(), request.getOras()
        );
    }

    public LoginResponse autentificare(LoginRequest request) {
        log.info("Autentificare client: {}", request.getEmail());
        return clientRepository.autentificareParola(
                request.getEmail(), request.getParola(), passwordEncoder
        );
    }

    public List<ProfilCategorieResponse> profilClient(Integer idClient) {
        log.info("Profil client id={}", idClient);
        return clientRepository.profilClient(idClient);
    }

    public List<IstoricResponse> istoricClient(Integer idClient) {
        log.info("Istoric client id={}", idClient);
        return clientRepository.istoricClient(idClient);
    }

    public List<ActoriFrecventiResponse> actoriFrecventi(Integer idClient, Integer numarMax) {
        int n = (numarMax != null && numarMax > 0) ? numarMax : 10;
        log.info("Actori frecventi client id={}, max={}", idClient, n);
        return clientRepository.actoriFrecventi(idClient, n);
    }

    public List<ClientSimilarResponse> clientiSimilari(Integer idClient, Integer numarMax) {
        int n = (numarMax != null && numarMax > 0) ? numarMax : 5;
        log.info("Clienti similari pentru client id={}, max={}", idClient, n);
        return clientRepository.clientiSimilari(idClient, n);
    }

    public List<Map<String, Object>> totiClientii() {
        return clientRepository.totiClientii();
    }

    public void dezactiveazaClient(Integer id) {
        log.info("Dezactivare client id={}", id);
        clientRepository.dezactiveazaClient(id);
    }
}