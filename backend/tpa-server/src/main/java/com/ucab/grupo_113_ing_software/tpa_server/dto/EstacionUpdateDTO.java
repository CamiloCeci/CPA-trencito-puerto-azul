package com.ucab.grupo_113_ing_software.tpa_server.dto;

public class EstacionUpdateDTO {
    private Long estacionId;
    private String nombre;
    private Double latitude;
    private Double longitude;
    private int contador;


    public EstacionUpdateDTO() {}

    public EstacionUpdateDTO(Long estacionId, String nombre, Double latitude, Double longitude) {
        this.estacionId = estacionId;
        this.nombre = nombre;
        this.latitude = latitude;
        this.longitude = longitude;
    }

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

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public int getContador() {
        return contador;
    }

    public void setContador(int contador) {
        this.contador = contador;
    }

}
