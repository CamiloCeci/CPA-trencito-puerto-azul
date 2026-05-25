package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.model.GpsCoordinate;
import com.ucab.grupo_113_ing_software.tpa_server.model.Usuario;
import com.ucab.grupo_113_ing_software.tpa_server.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public List<Usuario> getAllUsers() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUserById(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(user -> ResponseEntity.ok().body(user)).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Usuario> createUser(@RequestBody Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioRepository.save(usuario));
    }
}
