package com.moviesphere.dto.response;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private boolean success;
    private String mesaj;
    private T data;

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
}