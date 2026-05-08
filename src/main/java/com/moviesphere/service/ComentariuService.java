package com.moviesphere.service;

import com.moviesphere.dto.request.ComentariuRequest;
import com.moviesphere.repository.ComentariuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComentariuService {

    private final ComentariuRepository comentariuRepository;

    @Transactional
    public Integer adaugaComentariu(ComentariuRequest request) {
        log.info("Comentariu: client={}, film={}", request.getIdClient(), request.getIdFilm());

        Integer idComentariu = comentariuRepository.adaugaComentariu(
                request.getIdClient(),
                request.getIdFilm(),
                request.getContinut()
        );

        if (request.getOptiuniSelectate() != null && !request.getOptiuniSelectate().isEmpty()) {
            comentariuRepository.adaugaOptiuni(idComentariu, request.getOptiuniSelectate());
            log.info("Optiuni salvate: {} pentru comentariu id={}", request.getOptiuniSelectate(), idComentariu);
        }

        return idComentariu;
    }

    public List<Map<String, Object>> getOptiuniPredefinite() {
        return comentariuRepository.getOptiuniPredefinite();
    }

    public void adaugaComentariuActor(Integer idClient, Integer idActor,
                                      Integer idFilm, String continut) {
        log.info("Comentariu actor: client={}, actor={}, film={}", idClient, idActor, idFilm);
        comentariuRepository.adaugaComentariuActor(idClient, idActor, idFilm, continut);
    }

    public List<Map<String, Object>> getComentariiClient(Integer idClient) {
        log.info("Comentarii client id={}", idClient);
        return comentariuRepository.getComentariiClient(idClient);
    }
}