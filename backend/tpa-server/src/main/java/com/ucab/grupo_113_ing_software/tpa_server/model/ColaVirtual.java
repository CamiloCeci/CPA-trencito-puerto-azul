package com.ucab.grupo_113_ing_software.tpa_server.model;

import java.util.ArrayList;

public class ColaVirtual {
    private ArrayList<Object> listacola; //Utilizamos object para poder manipular distintos tipos de usuario (vip, socio)

    //Getters y Setters
    public ArrayList<Object> getlistacola() {
        return listacola;
        }

    public void setlistacola(ArrayList<Object> listacola) {
        this.listacola = listacola;
        }

    //Metodos
    public boolean AnadirALaCola(Object persona) {
        listacola.add(persona);
        return True;
    }

    public boolean EliminarDeLaCola(Object persona) {
        listacola.remove(persona);
        return True;
    }

    public boolean ReiniciarLaCola(Long id) {
        listacola.removeIf(persona -> persona.idEstacionActual.equals(id));
        return True;
    }
}

