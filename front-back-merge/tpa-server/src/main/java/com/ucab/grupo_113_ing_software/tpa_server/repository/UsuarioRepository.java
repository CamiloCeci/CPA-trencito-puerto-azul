package com.ucab.grupo_113_ing_software.tpa_server.repository;

import com.ucab.grupo_113_ing_software.tpa_server.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByCedula(String cedula);

}
