package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.service.AdministradorService;
import com.ucab.grupo_113_ing_software.tpa_server.model.Administrador;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/administrador")
@CrossOrigin(origins = "*")
public class AdministradorController {

    private final AdministradorService administradorService;

    public AdministradorController(AdministradorService administradorService) {
        this.administradorService = administradorService;
    }

    @PostMapping("/")
    public ResponseEntity<Administrador> createAdministrador(@RequestBody Administrador administrador) {
        return ResponseEntity.status(HttpStatus.CREATED).body(administradorService.crearAdministrador(administrador));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Administrador> getAdministradorById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(administradorService.findById(id));
    }

    @GetMapping("/")
    public ResponseEntity<Administrador> getAdministradorByCedula(@RequestParam String cedula) {
        return ResponseEntity.status(HttpStatus.OK).body(administradorService.findByCedula(cedula));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Administrador>> getAllAdministradores() {
        return ResponseEntity.status(HttpStatus.OK).body(administradorService.getAllAdministradores());
    }
}
