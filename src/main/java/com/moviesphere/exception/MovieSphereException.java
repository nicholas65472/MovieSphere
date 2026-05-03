package com.moviesphere.exception;

import lombok.Getter;

@Getter
public class MovieSphereException extends RuntimeException {
    private final String errorCode;

    public MovieSphereException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
