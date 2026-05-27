package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.repository.EstacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstacionService {
    private final EstacionRepository estacionRepository;

    @Autowired
    public EstacionService(EstacionRepository estacionRepository) {
        this.estacionRepository = estacionRepository;
    }

    public Estacion crearEstacion(Estacion estacion) {
        return estacionRepository.save(estacion);
    }

    public List<Estacion> getAllEstaciones() {
        return estacionRepository.findAll();
    }

    public Estacion eliminarEstacion(Long id) {
        Estacion estacion = estacionRepository.findById(id).orElse(null);
        if (estacion != null) {
            estacionRepository.deleteById(id);
        }
        return estacion;
    }
}