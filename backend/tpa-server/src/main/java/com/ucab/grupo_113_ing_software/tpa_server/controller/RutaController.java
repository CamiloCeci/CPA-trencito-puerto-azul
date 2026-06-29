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
@CrossOrigin(origins = "*") // Permite peticiones desde tu frontend en cualquier puerto
public class RutaController {

    private final RutaService rutaService;

    public RutaController(RutaService rutaService) {
        this.rutaService = rutaService;
    }

    // 1. OBTENER TODAS LAS RUTAS
    // GET http://localhost:8080/api/v1/rutas/
    @GetMapping("/")
    public ResponseEntity<List<Ruta>> obtenerTodas() {
        return ResponseEntity.ok(rutaService.obtenerTodas());
    }

    // 2. OBTENER LA RUTA ACTIVA
    // GET http://localhost:8080/api/v1/rutas/activa
    @GetMapping("/activa")
    public ResponseEntity<Ruta> obtenerActiva() {
        return rutaService.obtenerActiva()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CREAR UNA NUEVA RUTA
    // POST http://localhost:8080/api/v1/rutas/
    @PostMapping("/")
    public ResponseEntity<Ruta> crearRuta(@RequestBody RutaDTO rutaDTO) {
        try {
            Ruta nuevaRuta = rutaService.crearRuta(rutaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRuta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 4. ACTIVAR UNA RUTA ESPECÍFICA
    // PUT http://localhost:8080/api/v1/rutas/{id}/activar
    @PutMapping("/{id}/activar")
    public ResponseEntity<Ruta> activarRuta(@PathVariable Long id) {
        try {
            Ruta rutaActiva = rutaService.activarRuta(id);
            return ResponseEntity.ok(rutaActiva);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. ELIMINAR UNA RUTA
    // DELETE http://localhost:8080/api/v1/rutas/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRuta(@PathVariable Long id) {
        try {
            rutaService.eliminarRuta(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
