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
     * it updates the station; otherwise, it creates a new record.
     * Pass estacion = null to mark the socio as not waiting at any station.
     */
    @Transactional
    public SocioEstacion asignarEstacion(Socio socio, Estacion estacion) {
        Optional<SocioEstacion> existing = socioEstacionRepository.findBySocioId(socio.getId());
        if (existing.isPresent()) {
            SocioEstacion se = existing.get();
            se.setEstacion(estacion);
            return socioEstacionRepository.save(se);
        }

        SocioEstacion nuevo = new SocioEstacion(socio, estacion);
        return socioEstacionRepository.save(nuevo);
    }

    /**
     * Clears the station assignment for a socio (sets estacion to null).
     * The socio is no longer waiting at any station.
     */
    @Transactional
    public SocioEstacion desasignarEstacion(Long socioId) {
        Optional<SocioEstacion> existing = socioEstacionRepository.findBySocioId(socioId);
        if (existing.isPresent()) {
            SocioEstacion se = existing.get();
            se.setEstacion(null);
            return socioEstacionRepository.save(se);
        }
        return null;
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
     * Returns all socios/VIPs that are currently waiting at any station.
     */
    public List<SocioEstacion> findAllEsperando() {
        return socioEstacionRepository.findByEstacionIsNotNull();
    }

    /**
     * Removes the record for a given socio/VIP entirely.
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
