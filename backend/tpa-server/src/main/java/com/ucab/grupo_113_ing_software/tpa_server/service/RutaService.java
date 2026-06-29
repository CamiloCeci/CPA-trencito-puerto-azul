package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.dto.RutaDTO;
import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.model.Ruta;
import com.ucab.grupo_113_ing_software.tpa_server.model.RutaEstacion;
import com.ucab.grupo_113_ing_software.tpa_server.repository.EstacionRepository;
import com.ucab.grupo_113_ing_software.tpa_server.repository.RutaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RutaService {

    private final RutaRepository rutaRepository;
    private final EstacionRepository estacionRepository; // Asumiendo que ya tienes este repo

    public RutaService(RutaRepository rutaRepository, EstacionRepository estacionRepository) {
        this.rutaRepository = rutaRepository;
        this.estacionRepository = estacionRepository;
    }

    // 1. OBTENER TODAS LAS RUTAS
    public List<Ruta> obtenerTodas() {
        return rutaRepository.findAll();
    }

    // 2. OBTENER RUTA ACTIVA
    public Optional<Ruta> obtenerActiva() {
        return rutaRepository.findByActivaTrue();
    }

    // 3. CREAR RUTA
    @Transactional
    public Ruta crearRuta(RutaDTO dto) {
        Ruta nuevaRuta = new Ruta();
        nuevaRuta.setNombre(dto.getNombre());
        nuevaRuta.setActiva(false); // Por defecto se crea inactiva

        int posicion = 1;
        for (Long estacionId : dto.getEstacionesIds()) {
            Estacion estacion = estacionRepository.findById(estacionId)
                    .orElseThrow(() -> new RuntimeException("Estación no encontrada con ID: " + estacionId));

            RutaEstacion parada = new RutaEstacion(nuevaRuta, estacion, posicion);
            nuevaRuta.getEstaciones().add(parada);
            posicion++;
        }

        return rutaRepository.save(nuevaRuta);
    }

    // 4. ACTIVAR RUTA (Regla de negocio: desactiva las demás)
    @Transactional
    public Ruta activarRuta(Long id) {
        Ruta rutaAActivar = rutaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada"));

        // Desactivar cualquier otra ruta que esté activa actualmente
        rutaRepository.findByActivaTrue().ifPresent(ruta -> {
            ruta.setActiva(false);
            rutaRepository.save(ruta);
        });

        // Activar la ruta seleccionada
        rutaAActivar.setActiva(true);
        return rutaRepository.save(rutaAActivar);
    }

    // 5. ELIMINAR RUTA
    @Transactional
    public void eliminarRuta(Long id) {
        if (!rutaRepository.existsById(id)) {
            throw new RuntimeException("La ruta no existe");
        }
        rutaRepository.deleteById(id);
    }
}