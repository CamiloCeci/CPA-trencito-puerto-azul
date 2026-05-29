package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.model.Socio;
import com.ucab.grupo_113_ing_software.tpa_server.model.SocioEstacion;
import com.ucab.grupo_113_ing_software.tpa_server.service.EstacionService;
import com.ucab.grupo_113_ing_software.tpa_server.service.SocioEstacionService;
import com.ucab.grupo_113_ing_software.tpa_server.service.SocioService;

import java.util.List;
import java.util.Optional;

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
     * Body: { "socioId": 1, "estacionId": 2 }
     * Pass estacionId = null to mark the socio as not waiting.
     */
    @PostMapping("/")
    public ResponseEntity<?> asignarEstacion(@RequestBody AsignarRequest request) {
        Socio socio = socioService.findById(request.socioId);
        if (socio == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Socio no encontrado");
        }

        Long currEstacionId = socio.getIdEstacionActual();
        Estacion estacion = null;
        if (request.estacionId != null) {
            estacion = estacionService.findById(request.estacionId);
            if (estacion == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Estación no encontrada");
            } else if (currEstacionId != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya estás en una cola, debes salir de la cola actual para entrar en otra.");
            }
            estacionService.subirContadorPersonasEnCola(request.estacionId);
        } else {
            if (currEstacionId != null) {
                estacionService.bajarContadorPersonasEnCola(currEstacionId);
            }
        }

        SocioEstacion resultado = socioEstacionService.asignarEstacion(socio, estacion);

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
     * Gets all socios/VIPs assigned to a given station.
     */
    @GetMapping("/estacion/{estacionId}")
    public ResponseEntity<List<SocioEstacion>> getByEstacionId(@PathVariable Long estacionId) {
        return ResponseEntity.ok(socioEstacionService.findByEstacionId(estacionId));
    }

    /**
     * Gets all socios/VIPs currently waiting at any station (estacion != null).
     */
    @GetMapping("/esperando")
    public ResponseEntity<List<SocioEstacion>> getAllEsperando() {
        return ResponseEntity.ok(socioEstacionService.findAllEsperando());
    }

    /**
     * Gets all assignments.
     */
    @GetMapping("/all")
    public ResponseEntity<List<SocioEstacion>> getAll() {
        return ResponseEntity.ok(socioEstacionService.getAll());
    }

    /**
     * Clears a socio's station (sets to null = not waiting).
     */
    @PutMapping("/socio/{socioId}/desasignar")
    public ResponseEntity<?> desasignarEstacion(@PathVariable Long socioId) {
        Optional<SocioEstacion> est = socioEstacionService.findBySocioId(socioId);
        if (est.isEmpty() || est.get().getEstacion() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Socio no encontrado en la tabla o no tiene estación asignada");
        }

        // Save the estacion ID BEFORE desasignar sets it to null
        Long estacionId = est.get().getEstacion().getId();

        SocioEstacion resultado = socioEstacionService.desasignarEstacion(socioId);
        if (resultado == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Socio no encontrado en la tabla");
        }

        estacionService.bajarContadorPersonasEnCola(estacionId);

        return ResponseEntity.ok(resultado);
    }

    /**
     * Removes a socio's record entirely.
     */
    @DeleteMapping("/socio/{socioId}")
    public ResponseEntity<?> eliminarAsignacion(@PathVariable Long socioId) {
        Optional<SocioEstacion> est = socioEstacionService.findBySocioId(socioId);
        if (est.isPresent() && est.get().getEstacion() != null) {
            estacionService.bajarContadorPersonasEnCola(est.get().getEstacion().getId());
        }
        socioEstacionService.eliminarAsignacion(socioId);
        return ResponseEntity.ok("Asignación eliminada");
    }

    // Inner DTO for the assign request
    public static class AsignarRequest {
        public Long socioId;
        public Long estacionId;
    }
}
