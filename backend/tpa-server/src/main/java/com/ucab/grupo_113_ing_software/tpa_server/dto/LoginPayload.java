package com.ucab.grupo_113_ing_software.tpa_server.dto;


import java.io.Serializable;

public record LoginPayload(LoginRequest body){
    public record LoginRequest(String cedula, String clave) {}
}