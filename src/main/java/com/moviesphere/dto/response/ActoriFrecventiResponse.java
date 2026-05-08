package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ActoriFrecventiResponse {
    private Integer idActor;
    private String numeScena;
    private String nationalitate;
    private Long numarAparitii;
    private BigDecimal ratingMediu;
    private String tipRolFrecvent;
}