package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Administrador;
import com.ucab.grupo_113_ing_software.tpa_server.repository.AdministradorRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdministradorService {
    private final AdministradorRepository administradorRepository;

    @Autowired
    public AdministradorService(AdministradorRepository administradorRepository) {
        this.administradorRepository = administradorRepository;
    }

    public Administrador crearAdministrador(Administrador administrador) {
        return administradorRepository.save(administrador);
    }

    public Administrador findByCedula(String cedula) {
        return administradorRepository.findByCedula(cedula);
    }

    public Administrador findById(Long id) {
        return administradorRepository.findById(id).orElse(null);
    }

    public List<Administrador> getAllAdministradores() {
        return administradorRepository.findAll();
    }

}
