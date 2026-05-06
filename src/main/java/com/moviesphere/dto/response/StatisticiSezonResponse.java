package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StatisticiSezonResponse {
    private String sezon;
    private Long numarVizualizari;
    private BigDecimal ratingMediu;
    private String titluFilm;
}