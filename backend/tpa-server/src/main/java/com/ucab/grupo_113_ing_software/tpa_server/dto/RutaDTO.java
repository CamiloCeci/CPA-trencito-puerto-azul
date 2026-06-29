package com.ucab.grupo_113_ing_software.tpa_server.dto;

import java.util.List;

public class RutaDTO {
    private String nombre;
    private List<Long> estacionesIds; // Ejemplo: [1, 4, 1]

    // Getters y Setters
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Long> getEstacionesIds() {
        return estacionesIds;
    }

    public void setEstacionesIds(List<Long> estacionesIds) {
        this.estacionesIds = estacionesIds;
    }
}
