package com.ucab.grupo_113_ing_software.tpa_server.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("SOCIO")
public class Socio extends Usuario {

    @OneToOne(mappedBy = "socio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private ColaVirtual colaVirtual;

    public Socio() {
        super();
    }

    public Socio(Long id, String cedula, String clave) {
        super(id, cedula, clave, Rol.SOCIO);
    }

    public ColaVirtual getColaVirtual() {
        return colaVirtual;
    }

    public void setColaVirtual(ColaVirtual colaVirtual) {
        this.colaVirtual = colaVirtual;
    }

    /**
     * Returns the ID of the current station, or null if not waiting at any station.
     */
    public Long getIdEstacionActual() {
        return colaVirtual != null && colaVirtual.getEstacion() != null
                ? colaVirtual.getEstacion().getId()
                : null;
    }

    /**
     * Whether this socio is currently waiting at a station.
     */
    public boolean isEsperando() {
        return colaVirtual != null && colaVirtual.isEsperando();
    }
}
