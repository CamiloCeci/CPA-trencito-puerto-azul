package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Socio;
import com.ucab.grupo_113_ing_software.tpa_server.repository.SocioRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SocioService {
    private final SocioRepository socioRepository;

    @Autowired
    public SocioService(SocioRepository socioRepository) {
        this.socioRepository = socioRepository;
    }

    public Socio crearSocio(Socio socio) {
        return socioRepository.save(socio);
    }

    public Socio findByCedula(String cedula) {
        return socioRepository.findByCedula(cedula);
    }

    public Socio findById(Long id) {
        return socioRepository.findById(id).orElse(null);
    }

    public List<Socio> getAllSocios() {
        return socioRepository.findAll();
    }
}
