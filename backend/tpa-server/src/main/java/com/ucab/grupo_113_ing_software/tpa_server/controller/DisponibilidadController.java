package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.dto.HoraRequest;
import com.ucab.grupo_113_ing_software.tpa_server.model.Disponibilidad;
import com.ucab.grupo_113_ing_software.tpa_server.service.DisponibilidadService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/disponibilidad")
@CrossOrigin(origins = "*")
public class DisponibilidadController {
    private final DisponibilidadService disponibilidadService;


    // JSON para esta Ruta: {"horaDesde": "HH:mm", "horaHasta": "HH:mm"}

    public DisponibilidadController(DisponibilidadService disponibilidadService) {
        this.disponibilidadService = disponibilidadService;
    }

    @GetMapping("/desde")
    public ResponseEntity<?> getDesde() {
        return ResponseEntity.ok(disponibilidadService.getDesde());
    }

    @GetMapping("/hasta")
    public ResponseEntity<?> getHasta() {
        return ResponseEntity.ok(disponibilidadService.getHasta());
    }

    @GetMapping("/")
    public ResponseEntity<?> getDisponibilidad() {
        return ResponseEntity.ok(disponibilidadService.getDisponibilidad());
    }

    @PostMapping("/")
    public ResponseEntity<?> postDisponibilidad(@RequestBody HoraRequest horaRequest) {
        Disponibilidad disp = disponibilidadService.setDisponibilidad(horaRequest);
        return ResponseEntity.ok(disp);
    }

    @PutMapping("/")
    public ResponseEntity<?> putDisponibilidad(@RequestBody HoraRequest horaRequest) {
        return ResponseEntity.ok(disponibilidadService.updateDisponibilidad(horaRequest));
    }
}
