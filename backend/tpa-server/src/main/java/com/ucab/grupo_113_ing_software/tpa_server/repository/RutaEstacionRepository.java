package com.ucab.grupo_113_ing_software.tpa_server.repository;

import com.ucab.grupo_113_ing_software.tpa_server.model.RutaEstacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RutaEstacionRepository extends JpaRepository<RutaEstacion, Long> {

    // Busca todas las paradas de una ruta específica ordenadas físicamente
    List<RutaEstacion> findByRutaIdOrderByOrdenAsc(Long rutaId);
}
