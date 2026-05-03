package com.moviesphere.exception;

public class ViewingNotFoundException extends MovieSphereException {
    public ViewingNotFoundException(String message) {
        super("VIZUALIZARE_LIPSA", message);
    }
}