package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.dto.LoginPayload;
import com.ucab.grupo_113_ing_software.tpa_server.model.Usuario;
import com.ucab.grupo_113_ing_software.tpa_server.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ucab.grupo_113_ing_software.tpa_server.service.UsuarioService;
import com.ucab.grupo_113_ing_software.tpa_server.dto.LoginPayload;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = new UsuarioService(usuarioRepository);
    }

    @GetMapping("/")
    public List<Usuario> getAllUsers() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUserById(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(user -> ResponseEntity.ok().body(user)).orElse(ResponseEntity.notFound().build());
    }
//
//    @PostMapping("/")
//    public ResponseEntity<Usuario> createUser(@RequestBody Usuario usuario) {
//        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioRepository.save(usuario));
//    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody LoginPayload loginPayload) {
        String cedula = loginPayload.body().cedula();
        String clave = loginPayload.body().clave();
        if (usuarioService.authenticate(cedula, clave)) {
            Usuario user = usuarioService.findByCedula(cedula);
            return ResponseEntity.ok().body(user);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
