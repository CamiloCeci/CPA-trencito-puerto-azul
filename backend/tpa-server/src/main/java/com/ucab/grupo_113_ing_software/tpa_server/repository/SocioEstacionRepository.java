package com.ucab.grupo_113_ing_software.tpa_server.repository;

import com.ucab.grupo_113_ing_software.tpa_server.model.SocioEstacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SocioEstacionRepository extends JpaRepository<SocioEstacion, Long> {

    Optional<SocioEstacion> findBySocioId(Long socioId);

    List<SocioEstacion> findByEstacionId(Long estacionId);

    List<SocioEstacion> findByEstacionIsNotNull();

    void deleteBySocioId(Long socioId);
}
