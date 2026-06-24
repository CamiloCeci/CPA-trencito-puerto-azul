package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.dto.AsignarRequest;
import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.model.Socio;
import com.ucab.grupo_113_ing_software.tpa_server.model.ColaVirtual;
import com.ucab.grupo_113_ing_software.tpa_server.service.EstacionService;
import com.ucab.grupo_113_ing_software.tpa_server.service.ColaVirtualService;
import com.ucab.grupo_113_ing_software.tpa_server.service.SocioService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/socio-estacion")
@CrossOrigin(origins = "*")
public class ColaVirtualController {

    private final ColaVirtualService colaVirtualService;
    private final SocioService socioService;
    private final EstacionService estacionService;

    public ColaVirtualController(ColaVirtualService colaVirtualService,
                                    SocioService socioService,
                                    EstacionService estacionService) {
        this.colaVirtualService = colaVirtualService;
        this.socioService = socioService;
        this.estacionService = estacionService;
    }

    // JSON para esta ruta: {"socioId": 123, "estacionId": 123}

    @PostMapping("/")
    public ResponseEntity<?> asignarEstacion(@RequestBody AsignarRequest request) {
        Socio socio = socioService.findById(request.socioId());
        if (socio == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Socio no encontrado");
        }

        Long currEstacionId = socio.getIdEstacionActual();
        Estacion estacion = null;
        if (request.estacionId() != null) {
            estacion = estacionService.findById(request.estacionId());
            if (estacion == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Estación no encontrada");
            } else if (currEstacionId != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya estás en una cola, debes salir de la cola actual para entrar en otra.");
            }
            estacionService.subirContadorPersonasEnCola(request.estacionId());
        } else {
            if (currEstacionId != null) {
                estacionService.bajarContadorPersonasEnCola(currEstacionId);
            }
        }

        ColaVirtual resultado = colaVirtualService.asignarEstacion(socio, estacion);
        Map<String, Object> response = makeResponse(resultado, "Socio asignado exitosamente.");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @GetMapping("/socio/{socioId}/")
    public ResponseEntity<?> getBySocioId(@PathVariable Long socioId) {
        return colaVirtualService.findBySocioId(socioId)
                .<ResponseEntity<?>>map(cv -> ResponseEntity.ok(cv))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tiene estación asignada"));
    }


    @GetMapping("/estacion/{estacionId}/")
    public ResponseEntity<List<ColaVirtual>> getByEstacionId(@PathVariable Long estacionId) {
        return ResponseEntity.ok(colaVirtualService.findByEstacionId(estacionId));
    }

    @GetMapping("/estacion/{estacionId}/reset")
    public ResponseEntity<?> resetByEstacionId(@PathVariable Long estacionId) {
        try {
            colaVirtualService.resetColaEstacion(estacionId);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException ent) {
            return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(ent.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
        }
    }


    @GetMapping("/esperando/")
    public ResponseEntity<List<ColaVirtual>> getAllEsperando() {
        return ResponseEntity.ok(colaVirtualService.findAllEsperando());
    }


    @GetMapping("/all/")
    public ResponseEntity<List<ColaVirtual>> getAll() {
        return ResponseEntity.ok(colaVirtualService.getAll());
    }


    @PutMapping("/socio/{socioId}/desasignar/")
    public ResponseEntity<?> desasignarEstacion(@PathVariable Long socioId) {
        Optional<ColaVirtual> est = colaVirtualService.findBySocioId(socioId);
        if (est.isEmpty() || est.get().getEstacion() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Socio no encontrado en la tabla o no tiene estación asignada");
        }

        Long estacionId = est.get().getEstacion().getId();

        ColaVirtual resultado = colaVirtualService.desasignarEstacion(socioId);
        if (resultado == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Socio no encontrado en la tabla");
        }

        estacionService.bajarContadorPersonasEnCola(estacionId);
        Map<String, Object> response = makeResponse(resultado, "Socio desasignado exitosamente.");

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/socio/{socioId}/")
    public ResponseEntity<?> eliminarAsignacion(@PathVariable Long socioId) {
        Optional<ColaVirtual> est = colaVirtualService.findBySocioId(socioId);
        if (est.isPresent() && est.get().getEstacion() != null) {
            estacionService.bajarContadorPersonasEnCola(est.get().getEstacion().getId());
        }
        Map<String, Object> response;
        if (colaVirtualService.eliminarAsignacion(socioId)) {
            response = makeResponse(est, "Asignación eliminada exitosamente.");
            return ResponseEntity.ok(response);
        } else
            return ResponseEntity.internalServerError().body("Ocurrió un error, intente más tarde.");
    }

    private Map<String, Object> makeResponse(Object o, String msg) {
        Map<String, Object> response = new HashMap<>();
        response.put("msg", msg);
        response.put("puestos", o);
        return response;
    }

}
