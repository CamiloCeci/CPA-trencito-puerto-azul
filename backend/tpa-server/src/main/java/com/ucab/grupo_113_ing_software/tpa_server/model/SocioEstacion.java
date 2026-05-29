package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.*;

@Entity
@Table(name = "socio_estacion")
public class SocioEstacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "socio_id", nullable = false, unique = true)
    private Socio socio;

    @ManyToOne
    @JoinColumn(name = "estacion_id", nullable = false)
    private Estacion estacion;

    @Column(nullable = false)
    private boolean enCola = false;

    public SocioEstacion() {
    }

    public SocioEstacion(Socio socio, Estacion estacion, boolean enCola) {
        this.socio = socio;
        this.estacion = estacion;
        this.enCola = enCola;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Socio getSocio() {
        return socio;
    }

    public void setSocio(Socio socio) {
        this.socio = socio;
    }

    public Estacion getEstacion() {
        return estacion;
    }

    public void setEstacion(Estacion estacion) {
        this.estacion = estacion;
    }

    public boolean isEnCola() {
        return enCola;
    }

    public void setEnCola(boolean enCola) {
        this.enCola = enCola;
    }
}
