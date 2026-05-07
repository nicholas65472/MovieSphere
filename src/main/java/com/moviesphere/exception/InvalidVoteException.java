package com.moviesphere.exception;

public class InvalidVoteException extends MovieSphereException {
    public InvalidVoteException(String mesaj) {
        super("VOT_INVALID", mesaj);
    }
}