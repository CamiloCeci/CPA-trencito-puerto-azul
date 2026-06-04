package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.dto.PuestoPayload;
import com.ucab.grupo_113_ing_software.tpa_server.model.Tren;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class TrenService {
    private final Tren tren = new Tren(20);
    private final SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public TrenService(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public Tren getTren() {
        return tren;
    }

    public int getCapMax() {
        return tren.getCapMax();
    }

    public boolean setPuestosLlenos(int puestosLlenos) {
        boolean result = tren.setPuestosLlenos(puestosLlenos);
        simpMessagingTemplate.convertAndSend("/topic/tren", new PuestoPayload(this.getPuestosLlenos()));
        return result;
    }

    public int getPuestosLlenos() {
        return tren.getPuestosLibres();
    }

    public boolean aumentarPuestosLlenos() {
        boolean result = tren.aumentarPuestosLlenos();
        simpMessagingTemplate.convertAndSend("/topic/tren", new PuestoPayload(this.getPuestosLlenos()));
        return result;
    }

    public boolean disminuirPuestosLlenos() {
        boolean result = tren.disminuirPuestosLlenos();
        simpMessagingTemplate.convertAndSend("/topic/tren", new PuestoPayload(this.getPuestosLlenos()));
        return result;
    }
}
