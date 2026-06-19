package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.CoordenadaGps;
import com.ucab.grupo_113_ing_software.tpa_server.repository.GpsCoordenadasRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GpsService {
    private final GpsCoordenadasRepository gpsCoordenadasRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public GpsService(GpsCoordenadasRepository gpsCoordenadasRepository, SimpMessagingTemplate simpMessagingTemplate) {
        this.gpsCoordenadasRepository = gpsCoordenadasRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public CoordenadaGps getCoordenadas() {
        Optional<CoordenadaGps> coords = gpsCoordenadasRepository.findById((long) 1);
        return coords.orElse(null);
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
            simpMessagingTemplate.convertAndSend("/topic/trencito/posicion", coords.get());
            return coords.get();
        } else {
            CoordenadaGps coord =  new CoordenadaGps();
            coord.setLatitude(latitude);
            coord.setLongitude(longitude);
            gpsCoordenadasRepository.save(coord);
            simpMessagingTemplate.convertAndSend("/topic/trencito/posicion", coord);
            return coord;
        }
    }

    public CoordenadaGps updateCoordenadas(double latitude, double longitude, double speed) {
        Optional<CoordenadaGps> coords = gpsCoordenadasRepository.findById((long) 1);
        if (coords.isPresent()) {
            coords.get().setLatitude(latitude);
            coords.get().setLongitude(longitude);
            coords.get().setSpeed(speed);
            gpsCoordenadasRepository.save(coords.get());
            simpMessagingTemplate.convertAndSend("/topic/trencito/posicion", coords.get());
            return coords.get();
        }
        return null;
    }

}
