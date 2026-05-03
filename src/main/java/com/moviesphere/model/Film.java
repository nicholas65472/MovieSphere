package com.moviesphere.model;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class Film {
    private Integer id;
    private String titlu;
    private String descriere;
    private LocalDate dataLansarii;
    private Integer durataMinute;
    private Integer idCategorie;
    private BigDecimal rating;
    private Integer numarVoturi;
    private String posterUrl;
    private Boolean activ;
}