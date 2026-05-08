package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ClientSimilarResponse {
    private Integer idClientSimilar;
    private String numeComplet;
    private String oras;
    private BigDecimal scorSimilaritate;
    private Long categoriiComune;
    private Long actoriComuni;
    private String motiv;
}