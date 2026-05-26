package com.example.ativoeoperante.controllers;

import com.example.ativoeoperante.entities.Erro;
import com.example.ativoeoperante.entities.Usuario;
import com.example.ativoeoperante.repositories.UsuarioRepository;
import com.example.ativoeoperante.security.JWTTokenProvider;
import com.example.ativoeoperante.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("apis/acesso")
public class AcessoRestController {

    @Autowired
    UsuarioService usuarioService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/autenticar")
    public ResponseEntity<Object> autenticarUser(String login, int senha) {
        Usuario usuarioEncontrado = usuarioRepository.findByEmail(login);

        if (usuarioEncontrado != null && usuarioEncontrado.getSenha() == senha) {
            String token = JWTTokenProvider.getToken(
                    login,
                    "" + usuarioEncontrado.getNivel(),
                    usuarioEncontrado.getId()
            );
            return new ResponseEntity<>(token, HttpStatus.OK);
        }

        return new ResponseEntity<>(new Erro("E-mail ou senha inválidos."), HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/cadastrar-cidadao")
    public ResponseEntity<Object> cadastrarNovoCidadao(@RequestBody Usuario usuario) {
        if (usuario.getCpf() == null) {
            return new ResponseEntity<>(new Erro("CPF é obrigatório."), HttpStatus.BAD_REQUEST);
        }
        String cpfStr = usuario.getCpf().toString();
        if (cpfStr.length() != 11) {
            return new ResponseEntity<>(new Erro("CPF inválido. Deve conter 11 dígitos."), HttpStatus.BAD_REQUEST);
        }
        if (usuario.getEmail() == null || !usuario.getEmail().contains("@")) {
            return new ResponseEntity<>(new Erro("E-mail inválido."), HttpStatus.BAD_REQUEST);
        }
        if (usuario.getSenha() < 1000) {
            return new ResponseEntity<>(new Erro("Senha inválida. Use pelo menos 4 dígitos."), HttpStatus.BAD_REQUEST);
        }
        Usuario novoUsuario = usuarioService.inserirUsuario(usuario);
        if (novoUsuario != null) {
            return new ResponseEntity<>(novoUsuario, HttpStatus.CREATED);
        }
        if (!usuarioService.verificarEmail(usuario.getEmail())) {
            return new ResponseEntity<>(new Erro("Este e-mail já está cadastrado."), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(new Erro("Este CPF já está cadastrado."), HttpStatus.BAD_REQUEST);
    }
}