package com.moviesphere.exception;

public class AuthenticationException extends MovieSphereException {
    public AuthenticationException(String errorCode, String mesaj) {
        super(errorCode, mesaj);
    }
}