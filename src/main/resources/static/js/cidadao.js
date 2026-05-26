// Funções do Cidadão

async function carregarDashboardCidadao() {
    try {
        showLoading(true);
        await Promise.all([
            carregarOrgaos(),
            carregarTipos(),
            carregarMinhasDenuncias()
        ]);

        document.getElementById('formDenuncia')?.addEventListener('submit', enviarDenuncia);

        // Define data máxima como hoje e preenche com hoje por padrão
        const inputData = document.getElementById('denunciaData');
        if (inputData) {
            const hoje = new Date().toISOString().split('T')[0];
            inputData.max = hoje;
            inputData.value = hoje;
        }

        mostrarSecao('novaDenuncia');

    } catch (error) {
        showAlert('Erro ao carregar dashboard: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function mostrarSecao(secao) {
    const secoes = ['novaDenuncia', 'minhasDenuncias'];
    secoes.forEach(s => {
        const elem = document.getElementById(`secao${s.charAt(0).toUpperCase() + s.slice(1)}`);
        if (elem) elem.classList.add('hidden');
    });

    const secaoElem = document.getElementById(`secao${secao.charAt(0).toUpperCase() + secao.slice(1)}`);
    if (secaoElem) secaoElem.classList.remove('hidden');

    if (secao === 'minhasDenuncias') {
        carregarMinhasDenuncias();
    }
}

async function carregarOrgaos() {
    try {
        const orgaos = await apiRequest('/apis/cidadao/orgao-all', 'GET', null, true);
        const select = document.getElementById('denunciaOrgao');
        if (select && orgaos) {
            select.innerHTML = '<option value="">Selecione um órgão</option>';
            orgaos.forEach(orgao => {
                select.innerHTML += `<option value="${orgao.id}">${orgao.nome}</option>`;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar órgãos:', error);
    }
}

async function carregarTipos() {
    try {
        const tipos = await apiRequest('/apis/cidadao/tipos-all', 'GET', null, true);
        const select = document.getElementById('denunciaTipo');
        if (select && tipos) {
            select.innerHTML = '<option value="">Selecione um tipo</option>';
            tipos.forEach(tipo => {
                select.innerHTML += `<option value="${tipo.id}">${tipo.nome}</option>`;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar tipos:', error);
    }
}

async function enviarDenuncia(e) {
    e.preventDefault();

    try {
        showLoading(true);

        const tokenInfo = decodeToken(authToken);
        const usuarioId = tokenInfo?.id ? parseInt(tokenInfo.id) : null;

        if (!usuarioId) {
            showAlert('Erro: Não foi possível identificar o usuário.', 'error');
            return;
        }

        const dataValor = document.getElementById('denunciaData').value;
        if (!dataValor) {
            showAlert('Selecione uma data válida.', 'error');
            return;
        }

        const denuncia = {
            titulo: document.getElementById('denunciaTitulo').value,
            texto: document.getElementById('denunciaDescricao').value,
            dataHora: dataValor + 'T00:00:00',
            urgencia: parseInt(document.getElementById('denunciaUrgencia').value),
            orgao: { id: parseInt(document.getElementById('denunciaOrgao').value) },
            tipo: { id: parseInt(document.getElementById('denunciaTipo').value) },
            usuario: { id: usuarioId }
        };

        const formData = new FormData();
        formData.append('denuncia', new Blob([JSON.stringify(denuncia)], { type: 'application/json' }));

        const fotoInput = document.getElementById('denunciaFoto');
        if (fotoInput && fotoInput.files.length > 0) {
            formData.append('foto', fotoInput.files[0]);
        }

        await apiRequest('/apis/cidadao/denuncias', 'POST', formData, true);

        showAlert('Denúncia enviada com sucesso!', 'success');
        document.getElementById('formDenuncia').reset();
        document.getElementById('denunciaUrgencia').value = '3';
        document.getElementById('urgenciaValue').textContent = '3';

        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('denunciaData').value = hoje;
        document.getElementById('denunciaData').max = hoje;

    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Formata LocalDateTime
function formatarData(dataHora) {
    if (!dataHora) return 'N/A';
    const data = new Date(dataHora);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

async function carregarMinhasDenuncias() {
    try {
        showLoading(true);

        const denuncias = await apiRequest('/apis/cidadao/denuncias/usuario/minhas', 'GET', null, true);
        const container = document.getElementById('minhasDenunciasList');

        if (!container) return;

        if (!denuncias || denuncias.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Você ainda não fez nenhuma denúncia</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '<div class="denuncias-grid">';
        denuncias.forEach(denuncia => {
            container.innerHTML += `
                <div class="denuncia-card">
                    <span class="urgencia urgencia-${denuncia.urgencia}">Urgência ${denuncia.urgencia}</span>
                    <div class="denuncia-titulo">${denuncia.titulo}</div>
                    <div class="denuncia-descricao">${denuncia.texto}</div>
                    <div class="denuncia-meta">
                        <div><strong>Data:</strong> ${formatarData(denuncia.dataHora)}</div>
                        <div><strong>Órgão:</strong> ${denuncia.orgao?.nome || 'N/A'}</div>
                        <div><strong>Tipo:</strong> ${denuncia.tipo?.nome || 'N/A'}</div>
                    </div>
                    ${denuncia.foto ? `
                        <div class="denuncia-foto">
                            <img src="http://localhost:8080/uploads/${denuncia.foto}"
                                 style="max-width:100%; max-height:150px; object-fit:cover; border-radius:8px; margin-top:0.5rem; cursor:pointer;"
                                 onclick="window.open('http://localhost:8080/uploads/${denuncia.foto}', '_blank')">
                        </div>
                    ` : ''}
                    ${denuncia.feedback ? `
                        <div class="feedback">
                            <strong><i class="fas fa-comment"></i> Feedback:</strong>
                            <p>${denuncia.feedback.texto}</p>
                            <small>${denuncia.feedback.data ? formatarData(denuncia.feedback.data) : ''}</small>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML += '</div>';

    } catch (error) {
        console.error('Erro ao carregar denúncias:', error);
    } finally {
        showLoading(false);
    }
}