package com.ucab.grupo_113_ing_software.tpa_server.model;

public class Tren {
    private final int capMax = 20;
    private int puestosLibres;

    public Tren(int puestosLibres) {
        this.puestosLibres = puestosLibres;
    }

    public int getCapMax() {
        return capMax;
    }

    public int getPuestosLibres() {
        return puestosLibres;
    }

    public boolean setPuestosLlenos(int puestosLlenos) {
        if (puestosLlenos > capMax)
        {
            return false;
        }
        this.puestosLibres = puestosLlenos;
        return true;
    }

    public boolean aumentarPuestosLlenos() {
        if (puestosLibres < capMax) {
            this.puestosLibres++;
            return true;
        }
        return false;
    }

    public boolean disminuirPuestosLlenos() {
        if (puestosLibres > 0) {
            this.puestosLibres--;
            return true;
        }
        return false;
    }
}
