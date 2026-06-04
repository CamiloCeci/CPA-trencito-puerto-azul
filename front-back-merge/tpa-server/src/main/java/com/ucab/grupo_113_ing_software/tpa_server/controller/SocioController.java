package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.service.SocioService;
import com.ucab.grupo_113_ing_software.tpa_server.model.Socio;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/socio")
@CrossOrigin(origins = "*")
public class SocioController {

    private final SocioService socioService;

    public SocioController(SocioService socioService) {
        this.socioService = socioService;
    }

    // JSON para esta ruta: { "cedula": "prueba", "clave": "prueba" }

    @PostMapping("/")
    public ResponseEntity<Socio> createSocio(@RequestBody Socio socio) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socioService.crearSocio(socio));
    }

    @GetMapping("/{id}/")
    public ResponseEntity<Socio> getSocioById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(socioService.findById(id));
    }

    @GetMapping("/")
    public ResponseEntity<Socio> getSocioByCedula(@RequestParam String cedula) {
        return ResponseEntity.status(HttpStatus.OK).body(socioService.findByCedula(cedula));
    }

    @GetMapping("/all/")
    public ResponseEntity<List<Socio>> getAllSocios() {
        return ResponseEntity.status(HttpStatus.OK).body(socioService.getAllSocios());
    }

}
