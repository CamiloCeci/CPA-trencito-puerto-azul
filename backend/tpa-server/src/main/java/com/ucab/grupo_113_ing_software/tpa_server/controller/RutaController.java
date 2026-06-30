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

    /*
     * Da error por el .orElse, revisar si hace falta
     * 
     * // Obtener la ruta activa
     * 
     * @GetMapping("/activa")
     * public ResponseEntity<?> obtenerActiva() {
     * return rutaService.obtenerActiva()
     * .map(ResponseEntity::ok)
     * .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).
     * body("No hay una ruta activa en este momento."));
     * }
     */

    // Crear nueva ruta
    @PostMapping("/")
    public ResponseEntity<?> crearRuta(@RequestBody RutaDTO rutaDTO) {
        try {
            Ruta nuevaRuta = rutaService.crearRuta(rutaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRuta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Activar una ruta
    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activarRuta(@PathVariable Long id) {
        try {
            Ruta rutaActiva = rutaService.activarRuta(id);
            return ResponseEntity.ok(rutaActiva);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Eliminar una ruta
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRuta(@PathVariable Long id) {
        try {
            rutaService.eliminarRuta(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Editar una ruta
    @PutMapping("/{id}")
    public ResponseEntity<?> editarRuta(@PathVariable Long id, @RequestBody RutaDTO rutaDTO) {
        try {
            Ruta rutaActualizada = rutaService.editarRuta(id, rutaDTO);
            return ResponseEntity.ok(rutaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
