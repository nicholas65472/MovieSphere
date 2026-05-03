package com.moviesphere.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Vizualizare {
    private Integer id;
    private Integer idClient;
    private Integer idFilm;
    private Integer idVersiune;
    private LocalDateTime dataVizualizare;
    private Integer durataVizionata;
    private Boolean finalizata;
    private Integer vot;
}