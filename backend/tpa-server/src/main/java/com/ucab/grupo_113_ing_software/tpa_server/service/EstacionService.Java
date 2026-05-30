package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.repository.EstacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.ucab.grupo_113_ing_software.tpa_server.dto.EstacionUpdateDTO;

import java.util.List;

@Service
public class EstacionService {
    private final EstacionRepository estacionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public EstacionService(EstacionRepository estacionRepository, SimpMessagingTemplate messagingTemplate) {
        this.estacionRepository = estacionRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Estacion crearEstacion(Estacion estacion) {
        return estacionRepository.save(estacion);
    }

    public Estacion findById(Long id) {
        return estacionRepository.findById(id).orElse(null);
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

    public Estacion subirContadorPersonasEnCola(Long id) {
        Estacion estacion = estacionRepository.findById(id).orElse(null);
        if (estacion != null) {
            estacion.subirContador();
            Estacion saved = estacionRepository.save(estacion);
            messagingTemplate.convertAndSend("/topic/estaciones", new EstacionUpdateDTO(saved.getId(), saved.getContador()));
            return saved;
        }
        return null;
    }

    public Estacion bajarContadorPersonasEnCola(Long id) {
        Estacion estacion = estacionRepository.findById(id).orElse(null);
        if (estacion != null) {
            estacion.bajarContador();
            Estacion saved = estacionRepository.save(estacion);
            messagingTemplate.convertAndSend("/topic/estaciones", new EstacionUpdateDTO(saved.getId(), saved.getContador()));
            return saved;
        }
        return null;
    }
}