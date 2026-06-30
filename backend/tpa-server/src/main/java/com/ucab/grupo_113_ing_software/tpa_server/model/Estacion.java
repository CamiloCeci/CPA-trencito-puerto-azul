package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.*;

@Entity
@Table(name = "estaciones")
public class Estacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nombre;

    @Column(nullable = false)
    private int contadorPersonasEnCola;

    @Column(nullable = false)
    private double latitude;
    @Column(nullable = false)
    private double longitude;

    public Estacion(Long id, String nombre, double latitude, double longitude) {
        this.nombre = nombre;
        this.id = id;
        this.contadorPersonasEnCola = 0;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Estacion(String nombre, double latitude, double longitude) {
        this.nombre = nombre;
        this.contadorPersonasEnCola = 0;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Estacion() {
    }

    public String getNombre() {
        return nombre;
    }

    public Long getId() {
        return id;
    }

    public int getContador() {
        return contadorPersonasEnCola;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public void subirContador() {
        this.contadorPersonasEnCola++;
    }

    public void bajarContador() {
        if (contadorPersonasEnCola > 0) {
            this.contadorPersonasEnCola--;
        }
    }

}