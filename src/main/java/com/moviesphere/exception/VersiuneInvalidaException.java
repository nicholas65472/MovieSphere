package com.moviesphere.exception;

public class VersiuneInvalidaException extends MovieSphereException {
    public VersiuneInvalidaException(String mesaj) {
        super("VERSIUNE_INVALIDA", mesaj);
    }   
}