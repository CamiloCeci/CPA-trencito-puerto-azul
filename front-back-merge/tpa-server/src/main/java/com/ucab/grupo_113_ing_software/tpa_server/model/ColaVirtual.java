package com.ucab.grupo_113_ing_software.tpa_server.model;

import java.util.ArrayList;
import java.util.Objects;

public class ColaVirtual {
    private ArrayList<Socio> listacola; // Utilizamos object para poder manipular distintos tipos de usuario (vip,
                                        // socio)

    // Getters y Setters
    public ArrayList<Socio> getlistacola() {
        return listacola;
    }

    public void setlistacola(ArrayList<Socio> listacola) {
        this.listacola = listacola;
    }

    // Metodos
    public boolean AnadirALaCola(Socio persona) {
        listacola.add(persona);
        return true;
    }

    public boolean EliminarDeLaCola(Socio persona) {
        listacola.remove(persona);
        return true;
    }

    public boolean ReiniciarLaCola(Long id) {
        listacola.removeIf(persona -> Objects.equals(persona.getIdEstacionActual(), id));
        return true;
    }
}
