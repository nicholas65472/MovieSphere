package com.moviesphere.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VizualizareRequest {

    @NotNull(message = "Id-ul clientului este obligatoriu")
    private Integer idClient;

    @NotNull(message = "Id-ul filmului este obligatoriu")
    private Integer idFilm;

    private Integer idVersiune;

    @Min(value = 1, message = "Votul trebuie sa fie intre 1 si 10")
    @Max(value = 10, message = "Votul trebuie sa fie intre 1 si 10")
    private Integer vot;
}