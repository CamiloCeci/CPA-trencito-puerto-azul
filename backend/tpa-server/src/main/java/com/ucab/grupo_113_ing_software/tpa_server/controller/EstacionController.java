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

    // JSON para esta ruta: { "nombre": "Prueba", "latitude": 123, "longitude": 123}

    @PostMapping("/")
    public ResponseEntity<?> crearEstacion(@RequestBody Estacion estacion) {
        try {
            Estacion saved = estacionService.crearEstacion(estacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    @GetMapping("/")
    public ResponseEntity<List<Estacion>> getAllEstaciones() {
        List<Estacion> estaciones = estacionService.getAllEstaciones();
        return ResponseEntity.ok(estaciones);
    }

    // Actualización parcial: solo nombre O solo ubicación (lat + lng)
    // JSON nombre:     { "nombre": "Nuevo Nombre" }
    // JSON ubicación:  { "latitude": 10.62, "longitude": -66.74 }
    @PatchMapping("/{id}/")
    public ResponseEntity<?> actualizarEstacion(@PathVariable Long id,
            @RequestBody Map<String, Object> cambios) {
        try {
            Estacion updated = estacionService.actualizarEstacionParcial(id, cambios);
            if (updated == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Estación no encontrada o payload inválido.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
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

    private Map<String, Object> makeResponse(Estacion estacion, String msg) {
        Map<String, Object> response = new HashMap<>();
        response.put("msg", msg);
        response.put("estacion", estacion);
        return response;
    }
}
