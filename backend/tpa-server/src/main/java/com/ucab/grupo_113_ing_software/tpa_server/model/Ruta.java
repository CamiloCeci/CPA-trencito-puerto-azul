package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rutas")
public class Ruta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Boolean activa = false;

    // Relación bidireccional ordenada por el campo 'orden'
    @OneToMany(mappedBy = "ruta", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden ASC")
    private List<RutaEstacion> estaciones = new ArrayList<>();

    // Constructores
    public Ruta() {
    }

    public Ruta(String nombre, Boolean activa) {
        this.nombre = nombre;
        this.activa = activa;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public List<RutaEstacion> getEstaciones() {
        return estaciones;
    }

    public void setEstaciones(List<RutaEstacion> estaciones) {
        this.estaciones = estaciones;
    }
}