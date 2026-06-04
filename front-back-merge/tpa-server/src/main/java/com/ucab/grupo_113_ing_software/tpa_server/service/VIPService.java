package com.ucab.grupo_113_ing_software.tpa_server.service;

import com.ucab.grupo_113_ing_software.tpa_server.model.VIP;
import com.ucab.grupo_113_ing_software.tpa_server.repository.VIPRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VIPService {
    private final VIPRepository vipRepository;

    @Autowired
    public VIPService(VIPRepository vipRepository) {
        this.vipRepository = vipRepository;
    }

    public VIP crearVIP(VIP vip) {
        return vipRepository.save(vip);
    }

    public VIP findByCedula(String cedula) {
        return vipRepository.findByCedula(cedula);
    }

    public VIP findById(Long id) {
        return vipRepository.findById(id).orElse(null);
    }

    public List<VIP> getAllVIPs() {
        return vipRepository.findAll();
    }
}
