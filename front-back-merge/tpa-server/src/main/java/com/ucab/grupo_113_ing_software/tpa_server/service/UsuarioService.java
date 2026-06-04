package com.ucab.grupo_113_ing_software.tpa_server.service;


import com.ucab.grupo_113_ing_software.tpa_server.model.Usuario;
import com.ucab.grupo_113_ing_software.tpa_server.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public boolean authenticate(String cedula, String password) {
        Usuario u = findByCedula(cedula);
        return u != null && u.getClave().equals(password);
    }


    public Usuario findByCedula(String cedula) {
        return usuarioRepository.findByCedula(cedula);
    }

    public Usuario findById(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }
}


