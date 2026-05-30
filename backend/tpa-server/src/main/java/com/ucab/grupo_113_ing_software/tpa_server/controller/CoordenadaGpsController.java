package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.model.CoordenadaGps;
import com.ucab.grupo_113_ing_software.tpa_server.repository.GpsCoordenadasRepository;
import com.ucab.grupo_113_ing_software.tpa_server.service.GpsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/gps")
@CrossOrigin(origins = "*")
public class CoordenadaGpsController {
    private final GpsCoordenadasRepository gpsCoordenadasRepository;
    private final GpsService gpsService;

    public CoordenadaGpsController(GpsCoordenadasRepository gpsCoordenadasRepository) {
        this.gpsCoordenadasRepository = gpsCoordenadasRepository;
        this.gpsService = new GpsService(gpsCoordenadasRepository);
    }

    // No se le pasa JSON

    @GetMapping("/")
    public ResponseEntity<CoordenadaGps> getCoordenadaGps() {
        return gpsCoordenadasRepository.findById((long) 1).map(coord -> ResponseEntity.ok().body(coord))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{latitude}/{longitude}/")
    public ResponseEntity<?> updateCoordenadaGps(@PathVariable double latitude, @PathVariable double longitude) {
        CoordenadaGps coords = gpsService.updateCoordenadas(latitude, longitude);
        if (coords != null) {
            return ResponseEntity.ok().body(coords);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{latitude}/{longitude}/{speed}/")
    public ResponseEntity<?> updateCoordenadaGps(@PathVariable double latitude, @PathVariable double longitude,
            @PathVariable double speed) {
        CoordenadaGps coords = gpsService.updateCoordenadas(latitude, longitude, speed);
        if (coords != null) {
            return ResponseEntity.ok().body(coords);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/create/{latitude}/{longitude}/{speed}/")
    public ResponseEntity<?> createCoordenadaGps(@PathVariable double latitude, @PathVariable double longitude,
            @PathVariable double speed) {
        CoordenadaGps coords = gpsService.createCoordenadaas(latitude, longitude, speed);
        if (coords != null) {
            return ResponseEntity.ok().body(coords);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}