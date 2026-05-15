package com.moviesphere.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Client {
    private Integer id;
    private String nume;
    private String prenume;
    private String email;
    private String parolaHash;
    private String telefon;
    private String telefonMobil;
    private String adresa;
    private String oras;
    private LocalDate dataNasterii;
    private LocalDateTime dataInregistrare;
    private String rol;
    private Boolean activ;
}
