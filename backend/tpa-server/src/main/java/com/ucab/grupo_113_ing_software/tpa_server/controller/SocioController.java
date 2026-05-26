package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.repository.UsuarioRepository;
import com.ucab.grupo_113_ing_software.tpa_server.service.UsuarioService;
import com.ucab.grupo_113_ing_software.tpa_server.model.Socio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class SocioController {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public SocioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = new UsuarioService(usuarioRepository);
    }

    @PostMapping("/")
    public ResponseEntity<Socio> createUser(@RequestBody Socio usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioRepository.save(usuario));
    }

}
