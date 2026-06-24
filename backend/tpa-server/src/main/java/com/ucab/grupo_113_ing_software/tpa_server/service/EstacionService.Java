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
    public EstacionService(EstacionRepository estacionRepository, ColaVirtualRepository colaVirtualRepository, SimpMessagingTemplate messagingTemplate) {
        this.estacionRepository = estacionRepository;
        this.colaVirtualRepository = colaVirtualRepository;
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

    public Estacion actualizarEstacionParcial(Long id, Map<String, Object> cambios) {
        Estacion estacion = estacionRepository.findById(id).orElse(null);
        if (estacion == null) {
            return null;
        }

        String nombre = cambios.get("nombre") != null ? cambios.get("nombre").toString() : null;
        Object latitude = cambios.get("latitude");
        Object longitude = cambios.get("longitude");

        boolean hasNombre = nombre != null;
        boolean hasLatitude = latitude != null;
        boolean hasLongitude = longitude != null;
        int fieldCount = (hasNombre ? 1 : 0) + (hasLatitude ? 1 : 0) + (hasLongitude ? 1 : 0);

        if (hasNombre && fieldCount != 1) {
            return null;
        }
        if (!hasNombre && !(fieldCount == 1 || (hasLatitude && hasLongitude))) {
            return null;
        }

        if (hasNombre) {
            estacion.setNombre(nombre);
        } else if (hasLatitude && hasLongitude) {
            if (latitude instanceof Number) {
                estacion.setLatitude(((Number) latitude).doubleValue());
            } else {
                estacion.setLatitude(Double.parseDouble(latitude.toString()));
            }
            if (longitude instanceof Number) {
                estacion.setLongitude(((Number) longitude).doubleValue());
            } else {
                estacion.setLongitude(Double.parseDouble(longitude.toString()));
            }
        } else if (hasLatitude) {
            if (latitude instanceof Number) {
                estacion.setLatitude(((Number) latitude).doubleValue());
            } else {
                estacion.setLatitude(Double.parseDouble(latitude.toString()));
            }
        } else if (hasLongitude) {
            if (longitude instanceof Number) {
                estacion.setLongitude(((Number) longitude).doubleValue());
            } else {
                estacion.setLongitude(Double.parseDouble(longitude.toString()));
            }
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
