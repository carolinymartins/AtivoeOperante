// Funções de Autenticação

async function login(email, senha) {
    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/apis/acesso/autenticar?login=${encodeURIComponent(email)}&senha=${senha}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const error = await response.text();
            try {
                const json = JSON.parse(error);
                throw new Error(json.mensagem || 'E-mail ou senha inválidos.');
            } catch {
                throw new Error('E-mail ou senha inválidos.');
            }
        }

        const token = await response.text();
        authToken = token;
        userEmail = email;
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);

        showAlert(`Bem-vindo, ${email}!`, 'success');

        if (email === 'admin@pm.br') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'cidadao.html';
        }

    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function register(cpf, email, senha) {
    try {
        showLoading(true);

        const usuario = {
            cpf: parseInt(cpf),   // CPF como número (Long no backend)
            email: email,
            senha: parseInt(senha),
            nivel: 2
        };

        await apiRequest('/apis/acesso/cadastrar-cidadao', 'POST', usuario, false);

        showAlert('Cadastro realizado com sucesso! Faça login.', 'success');
        showLogin();

    } catch (error) {
        // Tenta extrair mensagem do JSON de erro
        try {
            const json = JSON.parse(error.message);
            showAlert(json.mensagem || error.message, 'error');
        } catch {
            showAlert(error.message, 'error');
        }
    } finally {
        showLoading(false);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}