package com.moviesphere.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email-ul este obligatoriu")
    @Email(message = "Format email invalid")
    private String email;

    @NotBlank(message = "Parola este obligatorie")
    private String parola;
}