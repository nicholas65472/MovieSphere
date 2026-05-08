package com.moviesphere.exception;

import com.moviesphere.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleEmailExists(EmailAlreadyExistsException ex) {
        log.warn("Email existent: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(ClientNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleClientNotFound(ClientNotFoundException ex) {
        log.warn("Client negasit: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(FilmNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleFilmNotFound(FilmNotFoundException ex) {
        log.warn("Film negasit: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(InvalidVoteException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidVote(InvalidVoteException ex) {
        log.warn("Vot invalid: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(ViewingNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleViewingNotFound(ViewingNotFoundException ex) {
        log.warn("Vizualizare negasita: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(VersiuneInvalidaException.class)
    public ResponseEntity<ApiResponse<Void>> handleVersiuneInvalida(VersiuneInvalidaException ex) {
        log.warn("Versiune invalida: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        log.warn("Autentificare esuata [{}]: {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(MovieSphereException.class)
    public ResponseEntity<ApiResponse<Void>> handleMovieSphere(MovieSphereException ex) {
        log.error("Eroare aplicatie [{}]: {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> erori = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            erori.put(fe.getField(), fe.getDefaultMessage());
        }
        log.warn("Erori validare: {}", erori);
        ApiResponse<Map<String, String>> response =
                ApiResponse.error("VALIDARE_ESUATA", "Date invalide");
        response.setData(erori);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAll(Exception ex) {
        log.error("Eroare neasteptata: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("EROARE_INTERNA",
                        "Eroare interna a serverului. Va rugam incercati din nou."));
    }
}