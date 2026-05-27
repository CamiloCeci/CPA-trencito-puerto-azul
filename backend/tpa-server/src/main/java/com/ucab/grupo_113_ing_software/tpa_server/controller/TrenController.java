package com.ucab.grupo_113_ing_software.tpa_server.controller;

import com.ucab.grupo_113_ing_software.tpa_server.dto.PuestoPayload;
import com.ucab.grupo_113_ing_software.tpa_server.model.Estacion;
import com.ucab.grupo_113_ing_software.tpa_server.model.Tren;
import com.ucab.grupo_113_ing_software.tpa_server.service.TrenService;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tren")
public class TrenController {
    private TrenService trenService;

    public TrenController() {
        trenService = new TrenService();
    }

    @GetMapping("/")
    public ResponseEntity<?> getPuestosLlenos() {
        return ResponseEntity.ok(trenService.getPuestosLlenos());
    }

    @GetMapping("/aumentar/")
    public ResponseEntity<?> aumentarPuestosLlenos() {
        boolean exito = trenService.aumentarPuestosLlenos();
        Map<String, Object> response = makeResponse(trenService.getPuestosLlenos(), exito ? "Puestos aumentados en uno."
                : "Los puestos ocupados en el tren no pueden ser mayores que veinte.");
        if (exito)
            return ResponseEntity.ok(response);
        else
            return ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/disminuir/")
    public ResponseEntity<?> disminuirPuestosLlenos() {
        boolean exito = trenService.disminuirPuestosLlenos();
        Map<String, Object> response = makeResponse(trenService.getPuestosLlenos(), exito ? "Puestos disminuidos en uno."
                : "Los puestos ocupados en el tren no puede ser negativo.");
        if (exito)
            return ResponseEntity.ok(response);
        else
            return ResponseEntity.badRequest().body(response);
    }

    @PatchMapping("/")
    public ResponseEntity<?> updatePuestosLlenos(@RequestBody PuestoPayload puestos) {
        boolean exito = trenService.setPuestosLlenos(puestos.puestos());
        Map<String, Object> response = makeResponse(trenService.getPuestosLlenos(), exito ? "Puestos actualizados exitosamente."
                : "Los puestos ocupados en el tren no puede ser un número menor a cero o mayor que veinte.");
        if (exito)
            return ResponseEntity.ok(response);
        else
            return ResponseEntity.badRequest().body(response);
    }

    private Map<String, Object> makeResponse(Object o, String msg) {
        Map<String, Object> response = new HashMap<>();
        response.put("msg", msg);
        response.put("puestos", o);
        return response;
    }
}