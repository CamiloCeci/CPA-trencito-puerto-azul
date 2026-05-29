package com.ucab.grupo_113_ing_software.tpa_server.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("SOCIO")
public class Socio extends Usuario {

    @OneToOne(mappedBy = "socio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private SocioEstacion socioEstacion;

    public Socio() {
        super();
    }

    public Socio(Long id, String cedula, String clave) {
        super(id, cedula, clave, Rol.SOCIO);
    }

    public SocioEstacion getSocioEstacion() {
        return socioEstacion;
    }

    public void setSocioEstacion(SocioEstacion socioEstacion) {
        this.socioEstacion = socioEstacion;
    }

    /**
     * Returns the ID of the current station, or null if not waiting at any station.
     */
    public Long getIdEstacionActual() {
        return socioEstacion != null && socioEstacion.getEstacion() != null
                ? socioEstacion.getEstacion().getId()
                : null;
    }

    /**
     * Whether this socio is currently waiting at a station.
     */
    public boolean isEsperando() {
        return socioEstacion != null && socioEstacion.isEsperando();
    }
}