package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("VIP") // 👈 La etiqueta para que H2 lo diferencie de un Socio normal
public class VIP extends Socio {

    public VIP() {
        super();
    }

    public VIP(Long id, String cedula, String clave) {
        super(id, cedula, clave);
    }
}
