package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RecomandareResponse {
    private Integer idFilm;
    private String titlu;
    private String categorie;
    private BigDecimal rating;
    private BigDecimal scorFinal;
    private String motiv;
}