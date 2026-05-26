package com.example.ativoeoperante.controllers;

import com.example.ativoeoperante.entities.Denuncia;
import com.example.ativoeoperante.entities.Erro;
import com.example.ativoeoperante.entities.Orgao;
import com.example.ativoeoperante.entities.Tipo;
import com.example.ativoeoperante.security.JWTTokenProvider;
import com.example.ativoeoperante.services.DenunciaService;
import com.example.ativoeoperante.services.OrgaoService;
import com.example.ativoeoperante.services.TipoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("apis/cidadao")
public class CidadaoRestController {

    @Autowired
    HttpServletRequest request;
    @Autowired
    DenunciaService denunciaService;
    @Autowired
    TipoService tipoService;
    @Autowired
    OrgaoService orgaoService;

    private ResponseEntity<Object> validarAcessoCidadao() {
        String token = request.getHeader("Authorization");

        if (token == null || !JWTTokenProvider.verifyToken(token)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        io.jsonwebtoken.Claims detalhes = JWTTokenProvider.getAllClaimsFromToken(token);
        if (detalhes != null && detalhes.get("nivel") != null) {
            String nivel = detalhes.get("nivel").toString();
            if (nivel.equals("1")) {
                return new ResponseEntity<>("Acesso restrito ao cidadão", HttpStatus.FORBIDDEN);
            }
        }
        return null;
    }

    // ================================================= DENÚNCIAS ============================================================================

    @PostMapping(value = "/denuncias", consumes = "multipart/form-data")
    public ResponseEntity<Object> adicionarDenuncia(
            @RequestPart("denuncia") Denuncia denuncia,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {

        ResponseEntity<Object> erroAcesso = validarAcessoCidadao();
        if (erroAcesso != null) return erroAcesso;

        if (foto != null && !foto.isEmpty()) {
            final String UPLOAD_FOLDER = "src/main/resources/static/uploads/";
            try {
                File uploadFolder = new File(UPLOAD_FOLDER);
                if (!uploadFolder.exists()) uploadFolder.mkdir();

                String nomeArquivo = System.currentTimeMillis() + "_" + foto.getOriginalFilename();
                foto.transferTo(new File(uploadFolder.getAbsolutePath() + "/" + nomeArquivo));
                denuncia.setFoto(nomeArquivo);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(new Erro("Erro ao salvar a foto."));
            }
        }

        denuncia = denunciaService.inserir(denuncia);
        if (denuncia != null)
            return ResponseEntity.ok(denuncia);
        else
            return ResponseEntity.badRequest().body(new Erro("Erro ao cadastrar a denúncia!"));
    }

    @GetMapping("/denuncias/usuario/{usuarioId}")
    public ResponseEntity<Object> buscarDenunciasDoUsuario(@PathVariable Long usuarioId) {
        ResponseEntity<Object> erroAcesso = validarAcessoCidadao();
        if (erroAcesso != null) return erroAcesso;

        List<Denuncia> denunciasList = denunciaService.buscarDenunciaPorUsuarioId(usuarioId);

        if (denunciasList != null)
            return ResponseEntity.ok(denunciasList);
        else
            return ResponseEntity.badRequest().body(new Erro("Denúncias não encontradas!"));
    }

    @GetMapping("/denuncias/usuario/minhas")
    public ResponseEntity<Object> buscarDenunciasDoUsuario(@RequestHeader("Authorization") String token) {
        System.out.println(">>> TOKEN RECEBIDO: " + token);

        ResponseEntity<Object> erroAcesso = validarAcessoCidadao();
        if (erroAcesso != null) return erroAcesso;

        String tokenLimpo = token.replace("Bearer ", "");
        System.out.println(">>> TOKEN LIMPO: " + tokenLimpo);
        System.out.println(">>> VERIFY: " + JWTTokenProvider.verifyToken(tokenLimpo));

        io.jsonwebtoken.Claims detalhes = JWTTokenProvider.getAllClaimsFromToken(tokenLimpo);
        System.out.println(">>> CLAIMS: " + detalhes);
        System.out.println(">>> ID RAW: " + detalhes.get("id"));
        System.out.println(">>> ID CLASSE: " + detalhes.get("id").getClass().getName());

        try {
            Long usuarioId = Long.parseLong(detalhes.get("id").toString());
            System.out.println(">>> USUARIO ID: " + usuarioId);
            List<Denuncia> minhasDenuncias = denunciaService.buscarDenunciaPorUsuarioId(usuarioId);
            return ResponseEntity.ok(minhasDenuncias);
        } catch (Exception e) {
            System.out.println(">>> ERRO: " + e.getMessage());
            return ResponseEntity.badRequest().body(new Erro("ID do usuário no token é inválido."));
        }
    }

    // ================================================= TIPOS ============================================================================

    @GetMapping("/tipos-all")
    public ResponseEntity<Object> buscarTipos() {
        ResponseEntity<Object> erroAcesso = validarAcessoCidadao();
        if (erroAcesso != null) return erroAcesso;

        List<Tipo> tipoList = tipoService.buscarTipos();
        return ResponseEntity.ok(tipoList);
    }

    // ================================================= ORGÃO ============================================================================

    @GetMapping("/orgao-all")
    public ResponseEntity<Object> buscarorgao() {
        ResponseEntity<Object> erroAcesso = validarAcessoCidadao();
        if (erroAcesso != null) return erroAcesso;

        List<Orgao> orgaoList = orgaoService.buscarOrgaos();
        return ResponseEntity.ok(orgaoList);
    }
}