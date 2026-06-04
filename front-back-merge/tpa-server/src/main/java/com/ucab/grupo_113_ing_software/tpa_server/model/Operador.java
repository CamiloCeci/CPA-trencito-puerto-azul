package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("OPERADOR")
public class Operador extends Usuario {

    public Operador() {
        super();
    }

    public Operador(Long id, String cedula, String clave) {
        super(id, cedula, clave, Rol.OPERADOR);
    }

    // Aquí irían sus funciones específicas luego
}