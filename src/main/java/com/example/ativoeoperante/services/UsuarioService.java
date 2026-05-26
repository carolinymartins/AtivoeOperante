package com.example.ativoeoperante.services;

import com.example.ativoeoperante.entities.Usuario;
import com.example.ativoeoperante.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> buscarTodosUsuarios() {
        return usuarioRepository.findAll();
    }

    public boolean verificarEmail(String email) {
        return usuarioRepository.findByEmail(email) == null;
    }

    public boolean verificarCpf(Long cpf) {
        return usuarioRepository.findByCpf(cpf) == null;
    }

    public Usuario inserirUsuario(Usuario novoUsuario) {
        if (!verificarEmail(novoUsuario.getEmail())) {
            return null;
        }
        if (!verificarCpf(novoUsuario.getCpf())) {
            return null;
        }
        novoUsuario.setNivel(2);
        return usuarioRepository.save(novoUsuario);
    }
}