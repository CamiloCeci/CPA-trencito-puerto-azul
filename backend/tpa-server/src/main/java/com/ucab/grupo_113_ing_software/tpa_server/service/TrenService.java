package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Tren;
import org.springframework.stereotype.Service;

@Service
public class TrenService {
    private final Tren tren = new Tren(0);

    public TrenService() {}

    public Tren getTren() {
        return tren;
    }

    public int getCapMax() {
        return tren.getCapMax();
    }

    public boolean setPuestosLlenos(int puestosLlenos) {
        return tren.setPuestosLlenos(puestosLlenos);
    }

    public int getPuestosLlenos() {
        return tren.getPuestosLlenos();
    }

    public boolean aumentarPuestosLlenos() {
        return tren.aumentarPuestosLlenos();
    }

    public boolean disminuirPuestosLlenos() {
        return tren.disminuirPuestosLlenos();
    }
}
