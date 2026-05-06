package com.moviesphere.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActualizeazaVotRequest {

    @NotNull
    private Integer idClient;

    @NotNull
    private Integer idFilm;

    @NotNull
    @Min(value = 1, message = "Votul trebuie sa fie intre 1 si 10")
    @Max(value = 10, message = "Votul trebuie sa fie intre 1 si 10")
    private Integer vot;
}