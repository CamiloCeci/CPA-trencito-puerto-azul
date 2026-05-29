package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.*;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;


@Entity
@Table(name = "disponibilidad_tren")
public class Disponibilidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalTime desde;

    @Column(nullable = false)
    private LocalTime hasta;

    @Transient
    private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    public Disponibilidad(Long id, LocalTime desde, LocalTime hasta) {
        this.id = id;
        this.desde = desde;
        this.hasta = hasta;
    }

    public Disponibilidad() {
    }

    public Disponibilidad(String horaDesde, String horaHasta) {
        this.desde = LocalTime.parse(horaDesde, formatter);
        this.hasta = LocalTime.parse(horaHasta, formatter);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalTime getDesde() {
        return desde;
    }

    public void setDesde(LocalTime desde) {
        this.desde = desde;
    }

    public void setDesde(String horaDesde) {
        this.desde = LocalTime.parse(horaDesde, formatter);
    }

    public LocalTime getHasta() {
        return hasta;
    }

    public void setHasta(LocalTime hasta) {
        this.hasta = hasta;
    }

    public void setHasta(String horaHasta) {
        this.hasta = LocalTime.parse(horaHasta, formatter);
    }
}
