package com.moviesphere.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String mesaj;
    private String codEroare;
    private T data;

    // ── Success responses ──────────────────────────────────────────

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data = data;
        return r;
    }

    public static <T> ApiResponse<T> ok(String mesaj, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.mesaj = mesaj;
        r.data = data;
        return r;
    }

    public static <T> ApiResponse<T> created(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.mesaj = "Creat cu succes";
        r.data = data;
        return r;
    }

    // ── Error responses ────────────────────────────────────────────

    public static <T> ApiResponse<T> error(String codEroare, String mesaj) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.codEroare = codEroare;
        r.mesaj = mesaj;
        return r;
    }

    public static <T> ApiResponse<T> error(String mesaj) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.mesaj = mesaj;
        return r;
    }
}