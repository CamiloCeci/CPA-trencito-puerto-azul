package com.ucab.grupo_113_ing_software.tpa_server.controller;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/estaciones")
public class EstacionController {
    private final EstacionService estacionService;

    public EstacionController(EstacionService estacionService) {
        this.estacionService = estacionService;
    }

    @PostMapping("/")
    public ResponseEntity<Estacion> crearEstacion(@RequestBody Estacion estacion) {
        Estacion saved = estacionService.crearEstacion(estacion);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    @GetMapping("/listar")
    public ResponseEntity<List<Estacion>> getAllEstaciones() {
        List<Estacion> estaciones = estacionService.getAllEstaciones();
        return ResponseEntity.ok(estaciones);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEstacion(@PathVariable Long id) {
        Estacion estacion = estacionService.eliminarEstacion(id);
        if (estacion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(estacion);
    }
}
