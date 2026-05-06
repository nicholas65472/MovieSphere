package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProfilCategorieResponse {
    private String categorie;
    private Long numarVizualizari;
    private BigDecimal ratingMediu;
    private BigDecimal procent;
}