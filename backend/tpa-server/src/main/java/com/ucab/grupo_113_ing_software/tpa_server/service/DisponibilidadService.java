package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.dto.HoraRequest;
import com.ucab.grupo_113_ing_software.tpa_server.model.Disponibilidad;
import com.ucab.grupo_113_ing_software.tpa_server.repository.DisponibilidadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
public class DisponibilidadService {
    private final DisponibilidadRepository disponibilidadRepository;

    @Autowired
    public DisponibilidadService(DisponibilidadRepository disponibilidadRepository) {
        this.disponibilidadRepository = disponibilidadRepository;
    }

    public Disponibilidad getDisponibilidad(   ) {
        return disponibilidadRepository.findById((long) 1).orElse(null);
    }

    public LocalTime getDesde() {
        return disponibilidadRepository.findById((long) 1).get().getDesde();
    }

    public LocalTime getHasta() {
        return disponibilidadRepository.findById((long) 1).get().getHasta();
    }

    public Disponibilidad setDisponibilidad(HoraRequest horaRequest) {
        Disponibilidad disp = new Disponibilidad(horaRequest.horaDesde(),  horaRequest.horaHasta());
        return disponibilidadRepository.save(disp);
    }

    public Disponibilidad updateDisponibilidad(HoraRequest horaRequest) {
        Disponibilidad disp = disponibilidadRepository.findById((long) 1).get();
        disp.setDesde(horaRequest.horaDesde());
        disp.setHasta(horaRequest.horaHasta());
        disponibilidadRepository.save(disp);
        return disponibilidadRepository.save(disp);
    }



}
