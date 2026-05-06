package com.moviesphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComentariuRequest {

    @NotNull
    private Integer idClient;

    @NotNull
    private Integer idFilm;

    @NotBlank(message = "Continutul comentariului este obligatoriu")
    private String continut;

    private java.util.List<Integer> optiuniSelectate;
}