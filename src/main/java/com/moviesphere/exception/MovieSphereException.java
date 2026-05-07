package com.moviesphere.exception;

import lombok.Getter;

@Getter
public class MovieSphereException extends RuntimeException {

    private final String errorCode;

    public MovieSphereException(String errorCode, String mesaj) {
        super(mesaj);
        this.errorCode = errorCode;
    }

}