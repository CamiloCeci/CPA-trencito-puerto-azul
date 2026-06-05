package com.ucab.grupo_113_ing_software.tpa_server.repository;

import com.ucab.grupo_113_ing_software.tpa_server.model.ColaVirtual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ColaVirtualRepository extends JpaRepository<ColaVirtual, Long> {

    Optional<ColaVirtual> findBySocioId(Long socioId);

    List<ColaVirtual> findByEstacionId(Long estacionId);

    List<ColaVirtual> findByEstacionIsNotNull();

    void deleteBySocioId(Long socioId);
}
