package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.service.EstacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/estaciones")
@CrossOrigin(origins = "*")
public class EstacionController {
    private final EstacionService estacionService;

    public EstacionController(EstacionService estacionService) {
        this.estacionService = estacionService;
    }

    // JSON para esta ruta: { "nombre": "Prueba", "latitude": 123, "longitude": 123 }

    @PostMapping("/")
    public ResponseEntity<Estacion> crearEstacion(@RequestBody Estacion estacion) {
        Estacion saved = estacionService.crearEstacion(estacion);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/")
    public ResponseEntity<List<Estacion>> getAllEstaciones() {
        List<Estacion> estaciones = estacionService.getAllEstaciones();
        return ResponseEntity.ok(estaciones);
    }

    @DeleteMapping("/{id}/")
    public ResponseEntity<?> eliminarEstacion(@PathVariable Long id) {
        Estacion estacion = estacionService.eliminarEstacion(id);
        if (estacion == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = makeResponse(estacion, "Estación eliminada exitosamente.");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/")
    public ResponseEntity<?> actualizarEstacionParcial(@PathVariable Long id, @RequestBody Map<String, Object> cambios) {
        Estacion updated = estacionService.actualizarEstacionParcial(id, cambios);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    private Map<String, Object> makeResponse(Estacion estacion, String msg) {
        Map<String, Object> response = new HashMap<>();
        response.put("msg", msg);
        response.put("estacion", estacion);
        return response;
    }
}