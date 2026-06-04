package com.ucab.grupo_113_ing_software.tpa_server.repository;

import com.ucab.grupo_113_ing_software.tpa_server.model.Operador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {
    Operador findByCedula(String cedula);
}
