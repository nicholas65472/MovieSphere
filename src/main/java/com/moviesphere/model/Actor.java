package com.moviesphere.model;

import lombok.Data;
import java.time.LocalDate;

@Data
public class Actor {
    private Integer id;
    private String numeScena;
    private String prenume;
    private String numeFamilie;
    private LocalDate dataNasterii;
    private String nationalitate;
    private String biografie;
}