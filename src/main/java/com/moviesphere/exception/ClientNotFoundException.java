package com.moviesphere.exception;

public class ClientNotFoundException extends MovieSphereException {
    public ClientNotFoundException(String mesaj) {
        super("CLIENT_INEXISTENT", mesaj);
    }
}