// Lógica da tela de Login e Cadastro

// ---- Máscara de CPF ----
document.getElementById('registerCpf').addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/,        '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/,               '$1.$2');
    this.value = v;
});

// ---- Validação de CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
}

// ---- Exibe/oculta mensagem de erro abaixo do campo ----
function mostrarErro(id, msg) {
    const el = document.getElementById(id);
    if (msg) { el.textContent = msg; el.style.display = 'block'; }
    else      { el.textContent = '';  el.style.display = 'none'; }
}

// ---- Troca de telas ----
function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('registerScreen').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('registerScreen').classList.remove('hidden');
}

// ---- Login ----
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;
    await login(email, senha);
});

// ---- Cadastro ----
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const cpfMask = document.getElementById('registerCpf').value;
    const email   = document.getElementById('registerEmail').value.trim();
    const senha   = document.getElementById('registerSenha').value;
    const confirm = document.getElementById('registerConfirmSenha').value;
    const cpf     = cpfMask.replace(/\D/g, '');

    let valido = true;

    if (!validarCPF(cpf)) {
        mostrarErro('cpfErro', 'CPF inválido. Verifique os dígitos.');
        valido = false;
    } else {
        mostrarErro('cpfErro', '');
    }

    if (!email.includes('@') || !email.includes('.')) {
        mostrarErro('emailErro', 'Informe um e-mail válido.');
        valido = false;
    } else {
        mostrarErro('emailErro', '');
    }

    if (!senha || senha.length < 4) {
        mostrarErro('senhaErro', 'A senha deve ter pelo menos 4 dígitos.');
        valido = false;
    } else {
        mostrarErro('senhaErro', '');
    }

    if (senha !== confirm) {
        mostrarErro('confirmSenhaErro', 'As senhas não coincidem.');
        valido = false;
    } else {
        mostrarErro('confirmSenhaErro', '');
    }

    if (!valido) return;

    await register(cpf, email, parseInt(senha));
});

//  Redireciona
const savedToken = localStorage.getItem('token');
const savedEmail = localStorage.getItem('userEmail');
if (savedToken && savedEmail) {
    authToken = savedToken;
    userEmail = savedEmail;
    window.location.href = savedEmail === 'admin@pm.br' ? 'admin.html' : 'cidadao.html';
}