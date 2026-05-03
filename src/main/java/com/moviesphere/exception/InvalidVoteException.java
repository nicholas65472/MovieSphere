package com.moviesphere.exception;

public class InvalidVoteException extends MovieSphereException {
    public InvalidVoteException(String message) {
        super("VOT_INVALID", message);
    }
}