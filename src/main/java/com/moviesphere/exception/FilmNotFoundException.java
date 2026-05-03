package com.moviesphere.exception;

public class FilmNotFoundException extends MovieSphereException {
    public FilmNotFoundException(String message) {
        super("FILM_INEXISTENT", message);
    }
}