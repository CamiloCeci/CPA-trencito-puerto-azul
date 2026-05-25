package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Transient;

@Entity
@DiscriminatorValue("SOCIO")
public class Socio extends Usuario {
    
    @Transient // 👈 H2 ignorará esto por completo
    private boolean enCola = false; 

    @Transient // 👈 H2 ignorará esto por completo
    private int idEstacionActual;


    public Socio() {
        super();
    }

    public Socio(Long id, String cedula, String clave) {
        super(id, cedula, clave, Rol.SOCIO);
        enCola = false;
        idEstacionActual = -1;
    }

    public boolean isEnCola() {
        return enCola;
    }

    public void setEnCola(boolean enCola) {
        this.enCola = enCola;
    }

    public int getIdEstacionActual() {
        return idEstacionActual;
    }

    public void setIdEstacionActual(int idEstacionActual) {
        this.idEstacionActual = idEstacionActual;
    }
}