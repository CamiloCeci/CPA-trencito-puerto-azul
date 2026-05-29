package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.model.VIP;
import com.ucab.grupo_113_ing_software.tpa_server.service.VIPService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vip")
@CrossOrigin(origins = "*")
public class VIPController {

    private final VIPService vipService;

    public VIPController(VIPService vipService) {
        this.vipService = vipService;
    }

    @PostMapping("/")
    public ResponseEntity<VIP> createVIP(@RequestBody VIP vip) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vipService.crearVIP(vip));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VIP> getVIPById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(vipService.findById(id));
    }

    @GetMapping("/")
    public ResponseEntity<VIP> getVIPByCedula(@RequestParam String cedula) {
        return ResponseEntity.status(HttpStatus.OK).body(vipService.findByCedula(cedula));
    }

    @GetMapping("/all")
    public ResponseEntity<List<VIP>> getAllVIPs() {
        return ResponseEntity.status(HttpStatus.OK).body(vipService.getAllVIPs());
    }
}
