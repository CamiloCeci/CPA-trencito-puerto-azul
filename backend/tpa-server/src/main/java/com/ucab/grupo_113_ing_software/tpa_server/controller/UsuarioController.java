package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.dto.LoginPayload;
import com.ucab.grupo_113_ing_software.tpa_server.model.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ucab.grupo_113_ing_software.tpa_server.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {

        this.usuarioService = usuarioService;
    }

    // JSON para esta ruta: { "cedula": "prueba", "clave": "prueba" }

    @GetMapping("/")
    public List<Usuario> getAllUsers() {
        return usuarioService.getAllUsuarios();
    }

    @GetMapping("/{id}/")
    public ResponseEntity<Usuario> getUserById(@PathVariable Long id) {
        Usuario user = usuarioService.findById(id);
        if (user != null) {
            return ResponseEntity.ok().body(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/login/")
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
