package com.moviesphere.exception;

public class FilmNotFoundException extends MovieSphereException {
    public FilmNotFoundException(String mesaj) {
        super("FILM_INEXISTENT", mesaj);
    }
}