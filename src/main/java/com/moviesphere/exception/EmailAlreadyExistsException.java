package com.moviesphere.exception;

public class EmailAlreadyExistsException extends MovieSphereException {
    public EmailAlreadyExistsException(String mesaj) {
        super("EMAIL_EXISTENT", mesaj);
    }
}