package com.moviesphere.service;

import com.moviesphere.repository.ActorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActorService {

    private final ActorRepository actorRepository;

    public List<Map<String, Object>> getAllActori() {
        return actorRepository.getAllActori();
    }

    public Map<String, Object> getActorById(Integer id) {
        return actorRepository.getActorById(id);
    }

    public List<Map<String, Object>> getFilmeActor(Integer idActor) {
        return actorRepository.getFilmeActor(idActor);
    }

    public List<Map<String, Object>> getComentariiActor(Integer idActor) {
        return actorRepository.getComentariiActor(idActor);
    }
}