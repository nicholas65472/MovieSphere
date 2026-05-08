package com.moviesphere.service;

import com.moviesphere.dto.request.ActualizeazaVotRequest;
import com.moviesphere.dto.request.VizualizareRequest;
import com.moviesphere.repository.VizualizareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VizualizareService {

    private final VizualizareRepository vizualizareRepository;

    public Integer adaugaVizualizare(VizualizareRequest request) {
        log.info("Vizualizare noua: client={}, film={}, vot={}",
                request.getIdClient(), request.getIdFilm(), request.getVot());
        return vizualizareRepository.adaugaVizualizare(
                request.getIdClient(),
                request.getIdFilm(),
                request.getIdVersiune(),
                request.getVot()
        );
    }

    public void actualizeazaVot(ActualizeazaVotRequest request) {
        log.info("Actualizare vot: client={}, film={}, vot={}",
                request.getIdClient(), request.getIdFilm(), request.getVot());
        vizualizareRepository.actualizeazaVot(
                request.getIdClient(),
                request.getIdFilm(),
                request.getVot()
        );
    }

    public List<Map<String, Object>> getVizualizariClient(Integer idClient) {
        log.info("Vizualizari client id={}", idClient);
        return vizualizareRepository.getVizualizariClient(idClient);
    }

    public void finalizeazaVizualizare(Integer idVizualizare) {
        log.info("Finalizare vizualizare id={}", idVizualizare);
        vizualizareRepository.finalizeazaVizualizare(idVizualizare);
    }
}