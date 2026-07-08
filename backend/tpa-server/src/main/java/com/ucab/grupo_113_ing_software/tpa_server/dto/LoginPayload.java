package com.ucab.grupo_113_ing_software.tpa_server.dto;

public record LoginPayload(LoginRequest body) {
    public record LoginRequest(String cedula, String clave) {
    }
}