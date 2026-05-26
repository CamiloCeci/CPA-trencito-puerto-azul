package com.ucab.grupo_113_ing_software.tpa_server.service;


import com.ucab.grupo_113_ing_software.tpa_server.model.CoordenadaGps;
import com.ucab.grupo_113_ing_software.tpa_server.repository.GpsCoordenadasRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.ToLongFunction;

@Service
public class GpsService {
    private final GpsCoordenadasRepository gpsCoordenadasRepository;

    public GpsService(GpsCoordenadasRepository gpsCoordenadasRepository) {
        this.gpsCoordenadasRepository = gpsCoordenadasRepository;
    }

    public CoordenadaGps getCoordenadas() {
        List<CoordenadaGps> coords = gpsCoordenadasRepository.findAll();
        return coords.getFirst();
    }

    public CoordenadaGps createCoordenadaas(double latitude, double longitude, double speed) {
        CoordenadaGps coordenadas = new CoordenadaGps(latitude, longitude, speed);
        gpsCoordenadasRepository.save(coordenadas);
        return coordenadas;
    }

    public CoordenadaGps updateCoordenadas(double latitude, double longitude) {
        Optional<CoordenadaGps> coords = gpsCoordenadasRepository.findById((long) 1);
        if (coords.isPresent()) {
            coords.get().setLatitude(latitude);
            coords.get().setLongitude(longitude);
            gpsCoordenadasRepository.save(coords.get());
            return coords.get();
        }
        return null;
    }

    public CoordenadaGps updateCoordenadas(double latitude, double longitude, double speed) {
        Optional<CoordenadaGps> coords = gpsCoordenadasRepository.findById((long) 1);
        if (coords.isPresent()) {
            coords.get().setLatitude(latitude);
            coords.get().setLongitude(longitude);
            coords.get().setSpeed(speed);
            gpsCoordenadasRepository.save(coords.get());
            return coords.get();
        }
        return null;
    }

}
