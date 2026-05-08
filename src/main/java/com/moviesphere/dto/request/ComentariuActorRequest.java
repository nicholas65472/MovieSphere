package com.moviesphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComentariuActorRequest {

    @NotNull(message = "Id-ul clientului este obligatoriu")
    private Integer idClient;

    @NotNull(message = "Id-ul actorului este obligatoriu")
    private Integer idActor;

    private Integer idFilm;

    @NotBlank(message = "Continutul comentariului este obligatoriu")
    private String continut;
}