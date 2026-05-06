package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class IstoricResponse {
    private Integer idFilm;
    private String titlu;
    private String categorie;
    private LocalDateTime dataVizualizare;
    private Integer vot;
    private String comentariu;
    private String sentiment;
}