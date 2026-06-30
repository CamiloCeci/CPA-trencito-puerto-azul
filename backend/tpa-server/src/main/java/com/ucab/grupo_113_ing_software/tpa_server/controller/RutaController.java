package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.dto.RutaDTO;
import com.ucab.grupo_113_ing_software.tpa_server.model.Ruta;
import com.ucab.grupo_113_ing_software.tpa_server.service.RutaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rutas")
@CrossOrigin(origins = "*")
public class RutaController {

    private final RutaService rutaService;

    public RutaController(RutaService rutaService) {
        this.rutaService = rutaService;
    }

    // Obtener todas las rutas
    @GetMapping("/")
    public ResponseEntity<List<Ruta>> obtenerTodas() {
        return ResponseEntity.ok(rutaService.obtenerTodas());
    }

    // Obtener la ruta activa
    @GetMapping("/activa")
    public ResponseEntity<Ruta> obtenerActiva() {
        return rutaService.obtenerActiva()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear nueva ruta
    @PostMapping("/")
    public ResponseEntity<Ruta> crearRuta(@RequestBody RutaDTO rutaDTO) {
        try {
            Ruta nuevaRuta = rutaService.crearRuta(rutaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRuta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Activar una ruta
    @PutMapping("/{id}/activar")
    public ResponseEntity<Ruta> activarRuta(@PathVariable Long id) {
        try {
            Ruta rutaActiva = rutaService.activarRuta(id);
            return ResponseEntity.ok(rutaActiva);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Eliminar una ruta
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRuta(@PathVariable Long id) {
        try {
            rutaService.eliminarRuta(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Editar una ruta
    @PutMapping("/{id}")
    public ResponseEntity<Ruta> editarRuta(@PathVariable Long id, @RequestBody RutaDTO rutaDTO) {
        try {
            Ruta rutaActualizada = rutaService.editarRuta(id, rutaDTO);
            return ResponseEntity.ok(rutaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
