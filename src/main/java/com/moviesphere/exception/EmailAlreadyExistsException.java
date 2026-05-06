package com.moviesphere.exception;

public class EmailAlreadyExistsException extends MovieSphereException {
    public EmailAlreadyExistsException(String message) {
        super ("Email_Existent", message);
    }
}
