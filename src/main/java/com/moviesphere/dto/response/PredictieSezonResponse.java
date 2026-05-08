package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PredictieSezonResponse {
    private Integer idFilm;
    private String titlu;
    private String categorie;
    private BigDecimal rating;
    private Long vizIstoriceSezon;
    private Long tendintaRecenta;
    private BigDecimal scorPredictie;
    private String explicatie;
}