package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Transient;

@Entity
@DiscriminatorValue("SOCIO")
public class Socio extends Usuario {

    @Transient
    private boolean enCola = false;

    @Transient
    private Long idEstacionActual;


    public Socio() {
        super();
    }

    public Socio(Long id, String cedula, String clave) {
        super(id, cedula, clave, Rol.SOCIO);
        enCola = false;
        idEstacionActual = null;
    }

    public boolean isEnCola() {
        return enCola;
    }

    public void setEnCola(boolean enCola) {
        this.enCola = enCola;
    }

    public Long getIdEstacionActual() {
        return idEstacionActual;
    }

    public void setIdEstacionActual(Long idEstacionActual) {
        this.idEstacionActual = idEstacionActual;
    }
}