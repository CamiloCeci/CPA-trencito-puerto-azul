package com.ucab.grupo_113_ing_software.tpa_server.dto;

public class EstacionUpdateDTO {
    private Long estacionId;
    private int contador;

    public EstacionUpdateDTO() {}

    public EstacionUpdateDTO(Long estacionId, int contador) {
        this.estacionId = estacionId;
        this.contador = contador;
    }

    public Long getEstacionId() {
        return estacionId;
    }

    public void setEstacionId(Long estacionId) {
        this.estacionId = estacionId;
    }

    public int getContador() {
        return contador;
    }

    public void setContador(int contador) {
        this.contador = contador;
    }
}
