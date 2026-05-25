package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.*;

@Entity
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false) // 👈 Evita que dos personas se registren con la misma cédula
    private String cedula;

    @Column(nullable = false)
    private String clave;

    @Enumerated(EnumType.STRING) // 👈 Le dice a H2 que guarde el rol como texto y no como un número
    private Rol rol;

    // (Aquí luego generaremos los getters, setters y constructores)
}

