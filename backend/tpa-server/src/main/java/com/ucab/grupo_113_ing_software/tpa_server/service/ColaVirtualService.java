package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.model.Socio;
import com.ucab.grupo_113_ing_software.tpa_server.model.ColaVirtual;
import com.ucab.grupo_113_ing_software.tpa_server.repository.ColaVirtualRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ColaVirtualService {

    private final ColaVirtualRepository colaVirtualRepository;

    public ColaVirtualService(ColaVirtualRepository colaVirtualRepository) {
        this.colaVirtualRepository = colaVirtualRepository;
    }

    /**
     * Asigna un socio a una estación. Si ya tiene una asignación, se actualiza.
     */
    @Transactional
    public ColaVirtual asignarEstacion(Socio socio, Estacion estacion) {
        Optional<ColaVirtual> existing = colaVirtualRepository.findBySocioId(socio.getId());
        if (existing.isPresent()) {
            ColaVirtual cv = existing.get();
            cv.setEstacion(estacion);
            return colaVirtualRepository.save(cv);
        }

        ColaVirtual nuevo = new ColaVirtual(socio, estacion);
        return colaVirtualRepository.save(nuevo);
    }

    /**
     * Desasigna la estación de un socio (la pone en null), pero mantiene el registro.
     */
    @Transactional
    public ColaVirtual desasignarEstacion(Long socioId) {
        Optional<ColaVirtual> existing = colaVirtualRepository.findBySocioId(socioId);
        if (existing.isPresent()) {
            ColaVirtual cv = existing.get();
            cv.setEstacion(null);
            return colaVirtualRepository.save(cv);
        }
        return null;
    }

    public Optional<ColaVirtual> findBySocioId(Long socioId) {
        return colaVirtualRepository.findBySocioId(socioId);
    }

    public List<ColaVirtual> findByEstacionId(Long estacionId) {
        return colaVirtualRepository.findByEstacionId(estacionId);
    }

    public List<ColaVirtual> findAllEsperando() {
        return colaVirtualRepository.findByEstacionIsNotNull();
    }

    @Transactional
    public boolean eliminarAsignacion(Long socioId) {
        try {
            colaVirtualRepository.deleteBySocioId(socioId);
            return true;
        }
        catch (Exception ignored) {
            return false;
        }
    }

    @Transactional
    public int resetColaEstacion(long id) {
        List<ColaVirtual> cv = colaVirtualRepository.findByEstacionId(id);
        int count = cv.size();
        for (ColaVirtual cvv : cv)
            cvv.setEstacion(null);
        return count;
    }

    public List<ColaVirtual> getAll() {
        return colaVirtualRepository.findAll();
    }
}
