package com.ucab.grupo_113_ing_software.tpa_server.model;

public class Tren {
    private final int capMax = 20;
    private int puestosLlenos;

    public Tren(int puestosLlenos) {
        this.puestosLlenos = puestosLlenos;
    }

    public int getCapMax() {
        return capMax;
    }

    public int getPuestosLlenos() {
        return puestosLlenos;
    }

    public boolean setPuestosLlenos(int puestosLlenos) {
        if (puestosLlenos > capMax)
        {
            return false;
        }
        this.puestosLlenos = puestosLlenos;
        return true;
    }

    public boolean aumentarPuestosLlenos() {
        if (puestosLlenos < capMax) {
            this.puestosLlenos++;
            return true;
        }
        return false;
    }

    public boolean disminuirPuestosLlenos() {
        if (puestosLlenos > 0) {
            this.puestosLlenos--;
            return true;
        }
        return false;
    }
}
