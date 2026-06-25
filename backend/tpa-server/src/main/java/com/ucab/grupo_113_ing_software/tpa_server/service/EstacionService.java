package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.model.ColaVirtual;
import com.ucab.grupo_113_ing_software.tpa_server.dto.EstacionUpdateDTO;
import com.ucab.grupo_113_ing_software.tpa_server.repository.EstacionRepository;
import com.ucab.grupo_113_ing_software.tpa_server.repository.ColaVirtualRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class EstacionService {
    private final EstacionRepository estacionRepository;
    private final ColaVirtualRepository colaVirtualRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public EstacionService(EstacionRepository estacionRepository, ColaVirtualRepository colaVirtualRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.estacionRepository = estacionRepository;
        this.colaVirtualRepository = colaVirtualRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Estacion crearEstacion(Estacion estacion) {
        if (estacionRepository.existsByNombre(estacion.getNombre())) {
            throw new IllegalArgumentException("Ya existe una estación con este ID.");
        }
        return estacionRepository.save(estacion);
    }

    public Estacion findById(Long id) {
        return estacionRepository.findById(id).orElse(null);
    }

    public List<Estacion> getAllEstaciones() {
        return estacionRepository.findAll();
    }

    public Estacion actualizarEstacionParcial(Long id, Map<String, Object> cambios) {
        Estacion estacion = estacionRepository.findById(id).orElse(null);
        if (estacion == null) {
            return null;
        }

        String nombre = cambios.get("nombre") != null ? cambios.get("nombre").toString().trim() : null;
        Object latitude = cambios.get("latitude");
        Object longitude = cambios.get("longitude");

        // Caso 1: Solo cambiar nombre
        if (nombre != null && !nombre.isEmpty()) {
            // Verificar que no exista otra estación con ese nombre (ignorando la actual)
            if (estacionRepository.existsByNombreAndIdNot(nombre, id)) {
                throw new IllegalArgumentException("Ya existe una estación con el nombre \"" + nombre + "\".");
            }
            estacion.setNombre(nombre);
        }
        // Caso 2: Solo cambiar ubicación (lat + lng juntos)
        else if (latitude != null && longitude != null) {
            double lat = (latitude instanceof Number)
                    ? ((Number) latitude).doubleValue()
                    : Double.parseDouble(latitude.toString());
            double lng = (longitude instanceof Number)
                    ? ((Number) longitude).doubleValue()
                    : Double.parseDouble(longitude.toString());
            estacion.setLatitude(lat);
            estacion.setLongitude(lng);
        } else {
            // Payload inválido: no se proveyó ningún campo editable
            return null;
        }

        return estacionRepository.save(estacion);
    }


    @Transactional
    public Estacion eliminarEstacion(Long id) {
        Estacion estacion = estacionRepository.findById(id).orElse(null);
        if (estacion != null) {
            List<ColaVirtual> sociosEnEstacion = colaVirtualRepository.findByEstacionId(id);
            for (ColaVirtual cv : sociosEnEstacion) {
                cv.setEstacion(null);
                colaVirtualRepository.save(cv);
            }
            estacionRepository.deleteById(id);
        }
        return estacion;
    }

    public Estacion subirContadorPersonasEnCola(Long id) {
        Estacion estacion = estacionRepository.findById(id).orElse(null);
        if (estacion != null) {
            estacion.subirContador();
            Estacion saved = estacionRepository.save(estacion);
            messagingTemplate.convertAndSend("/topic/estaciones",
                    new EstacionUpdateDTO(saved.getId(), saved.getContador()));
            return saved;
        }
        return null;
    }

    public Estacion bajarContadorPersonasEnCola(Long id) {
        Estacion estacion = estacionRepository.findById(id).orElse(null);
        if (estacion != null) {
            estacion.bajarContador();
            Estacion saved = estacionRepository.save(estacion);
            messagingTemplate.convertAndSend("/topic/estaciones",
                    new EstacionUpdateDTO(saved.getId(), saved.getContador()));
            return saved;
        }
        return null;
    }
}