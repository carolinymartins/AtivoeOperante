package com.example.ativoeoperante.repositories;

import com.example.ativoeoperante.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Usuario findByEmailAndSenha(String email, int senha);
    Usuario findByEmail(String email);
    Usuario findByCpf(Long cpf);
}
