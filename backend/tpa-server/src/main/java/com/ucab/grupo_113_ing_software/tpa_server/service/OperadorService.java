package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.Operador;
import com.ucab.grupo_113_ing_software.tpa_server.repository.OperadorRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OperadorService {
    private final OperadorRepository operadorRepository;

    @Autowired
    public OperadorService(OperadorRepository operadorRepository) {
        this.operadorRepository = operadorRepository;
    }

    public Operador crearOperador(Operador operador) {
        return operadorRepository.save(operador);
    }

    public Operador findByCedula(String cedula) {
        return operadorRepository.findByCedula(cedula);
    }

    public Operador findById(Long id) {
        return operadorRepository.findById(id).orElse(null);
    }

    public List<Operador> getAllOperadores() {
        return operadorRepository.findAll();
    }
}
