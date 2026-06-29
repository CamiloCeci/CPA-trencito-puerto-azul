package com.ucab.grupo_113_ing_software.tpa_server.repository;

import com.ucab.grupo_113_ing_software.tpa_server.model.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RutaRepository extends JpaRepository<Ruta, Long> {

    // Busca la ruta que tenga activa = true
    Optional<Ruta> findByActivaTrue();
}
