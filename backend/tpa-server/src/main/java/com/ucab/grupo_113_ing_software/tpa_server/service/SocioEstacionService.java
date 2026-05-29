package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.model.Socio;
import com.ucab.grupo_113_ing_software.tpa_server.model.SocioEstacion;
import com.ucab.grupo_113_ing_software.tpa_server.repository.SocioEstacionRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SocioEstacionService {

    private final SocioEstacionRepository socioEstacionRepository;

    @Autowired
    public SocioEstacionService(SocioEstacionRepository socioEstacionRepository) {
        this.socioEstacionRepository = socioEstacionRepository;
    }

    /**
     * Assigns a socio (or VIP) to a station. If the socio already has a record,
     * it updates the existing one; otherwise, it creates a new one.
     */
    @Transactional
    public SocioEstacion asignarEstacion(Socio socio, Estacion estacion, boolean enCola) {
        Optional<SocioEstacion> existing = socioEstacionRepository.findBySocioId(socio.getId());
        if (existing.isPresent()) {
            SocioEstacion se = existing.get();
            se.setEstacion(estacion);
            se.setEnCola(enCola);
            return socioEstacionRepository.save(se);
        }
        SocioEstacion nuevo = new SocioEstacion(socio, estacion, enCola);
        return socioEstacionRepository.save(nuevo);
    }

    /**
     * Finds the current station assignment for a given socio/VIP.
     */
    public Optional<SocioEstacion> findBySocioId(Long socioId) {
        return socioEstacionRepository.findBySocioId(socioId);
    }

    /**
     * Returns all socios/VIPs currently assigned to a given station.
     */
    public List<SocioEstacion> findByEstacionId(Long estacionId) {
        return socioEstacionRepository.findByEstacionId(estacionId);
    }

    /**
     * Returns all socios/VIPs that are in the queue at a given station.
     */
    public List<SocioEstacion> findEnColaByEstacionId(Long estacionId) {
        return socioEstacionRepository.findByEstacionIdAndEnColaTrue(estacionId);
    }

    /**
     * Removes the station assignment for a given socio/VIP.
     */
    @Transactional
    public void eliminarAsignacion(Long socioId) {
        socioEstacionRepository.deleteBySocioId(socioId);
    }

    /**
     * Returns all station assignments.
     */
    public List<SocioEstacion> getAll() {
        return socioEstacionRepository.findAll();
    }
}
