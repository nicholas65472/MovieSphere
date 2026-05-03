package com.moviesphere.exception;

public class ClientNotFoundException extends MovieSphereException {
    public ClientNotFoundException(String message) {
        super("Client_NotFound", message);
    }
}
