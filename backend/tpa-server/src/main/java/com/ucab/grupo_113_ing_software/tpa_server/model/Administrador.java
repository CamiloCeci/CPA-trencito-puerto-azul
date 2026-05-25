package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ADMINISTRADOR")
public class Administrador extends Operador {

    public Administrador() {
        super();
    }

    public Administrador(Long id, String cedula, String clave) {
        super(id, cedula, clave); // Llama al constructor de Operador
        // Spring H2 sabrá que es un administrador por el @DiscriminatorValue
    }
    
    // Aquí irían las funciones de control total luego
}