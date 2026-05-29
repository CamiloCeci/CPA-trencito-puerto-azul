package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.model.Socio;
import com.ucab.grupo_113_ing_software.tpa_server.model.SocioEstacion;
import com.ucab.grupo_113_ing_software.tpa_server.service.EstacionService;
import com.ucab.grupo_113_ing_software.tpa_server.service.SocioEstacionService;
import com.ucab.grupo_113_ing_software.tpa_server.service.SocioService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/socio-estacion")
@CrossOrigin(origins = "*")
public class SocioEstacionController {

    private final SocioEstacionService socioEstacionService;
    private final SocioService socioService;
    private final EstacionService estacionService;

    public SocioEstacionController(SocioEstacionService socioEstacionService,
                                    SocioService socioService,
                                    EstacionService estacionService) {
        this.socioEstacionService = socioEstacionService;
        this.socioService = socioService;
        this.estacionService = estacionService;
    }

    /**
     * Assigns a socio/VIP to a station.
     * Body: { "socioId": 1, "estacionId": 2, "enCola": true }
     */
    @PostMapping("/")
    public ResponseEntity<?> asignarEstacion(@RequestBody AsignarRequest request) {
        Socio socio = socioService.findById(request.socioId);
        if (socio == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Socio no encontrado");
        }

        Estacion estacion = estacionService.findById(request.estacionId);
        if (estacion == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Estación no encontrada");
        }

        SocioEstacion resultado = socioEstacionService.asignarEstacion(socio, estacion, request.enCola);
        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    /**
     * Gets the current station assignment for a socio/VIP.
     */
    @GetMapping("/socio/{socioId}")
    public ResponseEntity<?> getBySocioId(@PathVariable Long socioId) {
        return socioEstacionService.findBySocioId(socioId)
                .<ResponseEntity<?>>map(se -> ResponseEntity.ok(se))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tiene estación asignada"));
    }

    /**
     * Gets all socios/VIPs assigned to a station.
     */
    @GetMapping("/estacion/{estacionId}")
    public ResponseEntity<List<SocioEstacion>> getByEstacionId(@PathVariable Long estacionId) {
        return ResponseEntity.ok(socioEstacionService.findByEstacionId(estacionId));
    }

    /**
     * Gets all socios/VIPs in queue at a station.
     */
    @GetMapping("/estacion/{estacionId}/en-cola")
    public ResponseEntity<List<SocioEstacion>> getEnColaByEstacionId(@PathVariable Long estacionId) {
        return ResponseEntity.ok(socioEstacionService.findEnColaByEstacionId(estacionId));
    }

    /**
     * Gets all assignments.
     */
    @GetMapping("/all")
    public ResponseEntity<List<SocioEstacion>> getAll() {
        return ResponseEntity.ok(socioEstacionService.getAll());
    }

    /**
     * Removes a socio's station assignment.
     */
    @DeleteMapping("/socio/{socioId}")
    public ResponseEntity<?> eliminarAsignacion(@PathVariable Long socioId) {
        socioEstacionService.eliminarAsignacion(socioId);
        return ResponseEntity.ok("Asignación eliminada");
    }

    // Inner DTO for the assign request
    public static class AsignarRequest {
        public Long socioId;
        public Long estacionId;
        public boolean enCola;
    }
}
