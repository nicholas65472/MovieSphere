package com.moviesphere.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class LoginResponse {
    private Integer id;
    private String nume;
    private String prenume;
    private String email;
    private String oras;
}