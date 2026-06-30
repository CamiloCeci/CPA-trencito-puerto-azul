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
    private final EstacionRepository estacionRepository;

    public RutaService(RutaRepository rutaRepository, EstacionRepository estacionRepository) {
        this.rutaRepository = rutaRepository;
        this.estacionRepository = estacionRepository;
    }

    public List<Ruta> obtenerTodas() {
        return rutaRepository.findAll();
    }

    public Optional<Ruta> obtenerActiva() {
        return rutaRepository.findByActivaTrue();
    }

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

    @Transactional
    public void eliminarRuta(Long id) {
        if (!rutaRepository.existsById(id)) {
            throw new RuntimeException("La ruta no existe");
        }
        rutaRepository.deleteById(id);
    }

    @Transactional
    public Ruta editarRuta(Long id, RutaDTO dto) {
        Ruta rutaExistente = rutaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada con ID: " + id));

        // Actualizar datos básicos
        rutaExistente.setNombre(dto.getNombre());

        // Limpiar las paradas viejas para evitar duplicados
        rutaExistente.getEstaciones().clear();
        rutaRepository.saveAndFlush(rutaExistente); // Fuerza la limpieza en la base de datos

        // Insertar el nuevo itinerario ordenado
        int posicion = 1;
        for (Long estacionId : dto.getEstacionesIds()) {
            Estacion estacion = estacionRepository.findById(estacionId)
                    .orElseThrow(() -> new RuntimeException("Estación no encontrada con ID: " + estacionId));

            RutaEstacion parada = new RutaEstacion(rutaExistente, estacion, posicion);
            rutaExistente.getEstaciones().add(parada);
            posicion++;
        }

        return rutaRepository.save(rutaExistente);
    }
}