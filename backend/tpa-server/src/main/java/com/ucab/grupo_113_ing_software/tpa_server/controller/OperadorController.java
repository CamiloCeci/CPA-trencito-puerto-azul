package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.model.Operador;
import com.ucab.grupo_113_ing_software.tpa_server.service.OperadorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operador")
@CrossOrigin(origins = "*")
public class OperadorController {

    private final OperadorService operadorService;

    public OperadorController(OperadorService operadorService) {
        this.operadorService = operadorService;
    }

    // JSON para esta ruta: { "cedula": "prueba", "clave": "prueba" }

    @PostMapping("/")
    public ResponseEntity<Operador> createOperador(@RequestBody Operador operador) {
        return ResponseEntity.status(HttpStatus.CREATED).body(operadorService.crearOperador(operador));
    }

    @GetMapping("/{id}/")
    public ResponseEntity<Operador> getOperadorById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(operadorService.findById(id));
    }

    @GetMapping("/")
    public ResponseEntity<Operador> getOperadorByCedula(@RequestParam String cedula) {
        return ResponseEntity.status(HttpStatus.OK).body(operadorService.findByCedula(cedula));
    }

    @GetMapping("/all/")
    public ResponseEntity<List<Operador>> getAllOperadores() {
        return ResponseEntity.status(HttpStatus.OK).body(operadorService.getAllOperadores());
    }
}
