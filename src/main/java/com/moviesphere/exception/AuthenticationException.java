package com.moviesphere.exception;

public class AuthenticationException extends MovieSphereException {
    public AuthenticationException(String errorCode, String message) {
        super(errorCode, message);
    }
}
