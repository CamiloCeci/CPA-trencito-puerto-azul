package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ADMINISTRADOR")
public class Administrador extends Operador {

    public Administrador() {
        super();
        super.setRol(Rol.ADMINISTRADOR);
    }

    public Administrador(Long id, String cedula, String clave) {
        super(id, cedula, clave);
        super.setRol(Rol.ADMINISTRADOR);
    }

}