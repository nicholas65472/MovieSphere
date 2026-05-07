package com.moviesphere.exception;

public class ViewingNotFoundException extends MovieSphereException {
    public ViewingNotFoundException(String mesaj) {
        super("VIZUALIZARE_LIPSA", mesaj);
    }
}