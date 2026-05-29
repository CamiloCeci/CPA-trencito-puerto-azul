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

    // Convenience methods that delegate to socioEstacion

    public boolean isEnCola() {
        return socioEstacion != null && socioEstacion.isEnCola();
    }

    public void setEnCola(boolean enCola) {
        if (socioEstacion != null) {
            socioEstacion.setEnCola(enCola);
        }
    }

    public Long getIdEstacionActual() {
        return socioEstacion != null && socioEstacion.getEstacion() != null
                ? socioEstacion.getEstacion().getId()
                : null;
    }
}