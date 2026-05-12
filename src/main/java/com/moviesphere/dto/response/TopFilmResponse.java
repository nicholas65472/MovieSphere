package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TopFilmResponse {
    private Integer idFilm;
    private String titlu;
    private String categorie;
    private BigDecimal rating;
    private Integer numarVoturi;
    private Long numarVizualizari;
    private String posterUrl;
}
