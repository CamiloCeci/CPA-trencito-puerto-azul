package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "rol", discriminatorType = DiscriminatorType.STRING)
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @Column(unique = true, nullable = false)
    protected String cedula;

    @Column(nullable = false)
    protected String clave;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", insertable = false, updatable = false)
    protected Rol rol;

    public Usuario() {
    }

    public Usuario(String cedula, String clave) {
        this.cedula = cedula;
        this.clave = clave;
    }

    public Usuario(Long id, String cedula, String clave, Rol rol) {
        this.id = id;
        this.cedula = cedula;
        this.clave = clave;
        this.rol = rol;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }
}
