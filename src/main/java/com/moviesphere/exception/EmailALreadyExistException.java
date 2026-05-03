package com.moviesphere.exception;

public class EmailALreadyExistException extends MovieSphereException {
    public EmailALreadyExistException(String message) {
        super ("Email_Existent", message);
    }
}
