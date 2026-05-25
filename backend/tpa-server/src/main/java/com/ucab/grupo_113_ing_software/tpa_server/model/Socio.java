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
    private String idEstacionActual;

    // Aquí irían tus constructores, getters y setters
}