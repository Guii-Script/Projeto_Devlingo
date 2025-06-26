// ===============================================
// VARIÁVEIS GLOBAIS
// ===============================================
let trilhaAtual = null;
let etapaAtual = null;
let perguntaAtual = 0;
let arrastandoPalavra = null;

// Status do Jogador
let vidas = 3;
let streak = 0;
let moedas = 0;

// Controle do Timer de Vidas
let intervaloRecarga = null;
const TEMPO_TOTAL_RECARGA = 5; // 60 segundos


// ===============================================
// INICIALIZAÇÃO
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  carregarEstadoInicial();
  carregarTrilhas();
  carregarMissoesDiarias(); // <- NOVA FUNÇÃO
});


// ===============================================
// CARREGAMENTO E PERSISTÊNCIA
// ===============================================

function carregarEstadoInicial() {
  const statusContainer = document.querySelector('.status-jogador');
  if (!statusContainer) return;

  vidas = parseInt(statusContainer.getAttribute('data-vidas'), 10) || 3;
  streak = parseInt(statusContainer.getAttribute('data-streak'), 10) || 0;
  moedas = parseInt(statusContainer.getAttribute('data-moedas'), 10) || 0;
  const tempoRecargaServidor = statusContainer.getAttribute('data-tempo-recarga');

  atualizarVidas();
  atualizarStreak();
  atualizarMoedas();

  if (vidas <= 0 && tempoRecargaServidor) {
    const tempoInicio = new Date(tempoRecargaServidor.replace(' ', 'T'));
    const agora = new Date();

    const segundosPassados = Math.floor((agora - tempoInicio) / 1000);
    const segundosRestantes = TEMPO_TOTAL_RECARGA - segundosPassados;

    if (segundosRestantes > 0) {
      iniciarRecargaVidas(segundosRestantes);
    } else {
      vidas = 3;
      atualizarVidas();
      salvarProgresso();
    }
  }
}

async function carregarTrilhas() {
  try {
    const response = await fetch('conexao.php');
    if (!response.ok) throw new Error('Erro ao buscar dados do servidor');
    const trilhasDoBanco = await response.json();

    window.trilhas = trilhasDoBanco.reduce((acc, trilha) => {
      acc[trilha.nome] = trilha;
      return acc;
    }, {});

    renderizarTrilhas();
  } catch (error) {
    console.error('Erro ao carregar trilhas:', error);
    mostrarFeedback('Falha ao carregar trilhas. Tente recarregar a página.', false);
  }
}

async function salvarProgresso() {
  try {
    await fetch('atualizar_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vidas, streak, moedas }),
    });
  } catch (error) {
    console.error('Não foi possível salvar o progresso:', error);
  }
}

// ===============================================
// LÓGICA DE MISSÕES (NOVO BLOCO)
// ===============================================

async function carregarMissoesDiarias() {
    try {
        const response = await fetch('buscar_missoes.php');
        if (!response.ok) {
            throw new Error('Falha ao buscar missões');
        }
        const missoes = await response.json();
        renderizarMissoes(missoes);
    } catch (error) {
        console.error("Erro ao carregar missões diárias:", error);
    }
}

function renderizarMissoes(missoes) {
    const container = document.getElementById('missoesDiariasContainer');
    if (!container) return;
    container.innerHTML = '<h3><i class="fas fa-calendar-day"></i> Missões Diárias</h3>'; // Título

    if (missoes.length === 0) {
        container.innerHTML += '<p>Nenhuma missão para hoje. Volte amanhã!</p>';
        return;
    }

    missoes.forEach(missao => {
        const progressoPercent = missao.meta > 0 ? (missao.progresso / missao.meta) * 100 : 0;
        const concluidaClasse = missao.concluida ? 'concluida' : '';

        const missaoCard = `
            <div class="missao-card ${concluidaClasse}">
                <h4>${missao.nome} ${missao.concluida ? '<i class="fas fa-check-circle"></i>' : ''}</h4>
                <p>${missao.descricao} (+${missao.recompensa_gemas} <i class="fas fa-gem"></i>)</p>
                <div class="barra-progresso">
                    <div class="barra-preenchida" style="width: ${progressoPercent}%"></div>
                </div>
                <span class="progresso-texto">${missao.progresso} / ${missao.meta}</span>
            </div>
        `;
        container.innerHTML += missaoCard;
    });
}

async function notificarProgressoMissao(tipo_evento) {
    try {
        const response = await fetch('atualizar_missao.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo_evento: tipo_evento })
        });

        const resultado = await response.json();

        if (resultado.sucesso && resultado.recompensas.length > 0) {
            let totalGemas = 0;
            resultado.recompensas.forEach(rec => {
                totalGemas += rec.gemas;
                mostrarFeedback(`Missão Concluída! +${rec.gemas} gemas!`, true);
            });
            moedas += totalGemas;
            atualizarMoedas();
            // Recarrega as missões para mostrar o status "concluído"
            setTimeout(carregarMissoesDiarias, 1500);
        }
    } catch (error) {
        console.error("Erro ao notificar progresso da missão:", error);
    }
}


// ===============================================
// ATUALIZAÇÃO DA INTERFACE (UI)
// ===============================================
function atualizarVidas() {
  const elementoVidas = document.getElementById('vidas');
  if (elementoVidas) elementoVidas.textContent = vidas;
}

function atualizarStreak() {
  const elementoStreak = document.getElementById('streak');
  if (elementoStreak) {
    elementoStreak.textContent = streak;
    elementoStreak.className = 'streak';
    if (streak >= 3) {
      elementoStreak.classList.add('streak-high');
    } else if (streak >= 1) {
      elementoStreak.classList.add('streak-medium');
    }
  }
}

function atualizarMoedas() {
    const elementoMoedas = document.getElementById('moedas');
    if(elementoMoedas) {
        elementoMoedas.textContent = moedas;
    }
}


// ===============================================
// LÓGICA DE JOGO E RESPOSTAS
// ===============================================
function verificarRespostaMultiplaEscolha(correta) {
  const opcaoSelecionada = event.currentTarget;
  document.querySelectorAll('.opcao').forEach(btn => btn.disabled = true);

  if (correta) {
    opcaoSelecionada.classList.add('correta');
    mostrarFeedback('Resposta correta!', true);
    streak++;
    moedas += 10;
    atualizarStreak();
    atualizarMoedas();
    salvarProgresso();
    // Notifica progresso de missão do tipo "ACERTAR_PERGUNTA"
    notificarProgressoMissao('ACERTAR_PERGUNTA');
    setTimeout(() => {
      perguntaAtual++;
      exibirPerguntaAtual();
    }, 1500);
  } else {
    opcaoSelecionada.classList.add('incorreta');
    mostrarFeedback('Resposta incorreta! Tente novamente.', false);
    streak = 0;
    atualizarStreak();
    aplicarDano();
    setTimeout(() => {
      opcaoSelecionada.classList.remove('incorreta');
      document.querySelectorAll('.opcao').forEach(btn => btn.disabled = false);
    }, 1500);
  }
}

function verificarRespostaLacuna() {
  const lacunas = document.querySelectorAll('.lacuna');
  let todasCorretas = true;
  document.querySelector('.botao-verificar').disabled = true;

  lacunas.forEach(lacuna => {
    const respostaUsuario = lacuna.dataset.preenchido;
    const respostaCorreta = lacuna.dataset.resposta;
    if (respostaUsuario && respostaUsuario.toLowerCase() === respostaCorreta.toLowerCase()) {
      lacuna.classList.add('correta');
    } else {
      lacuna.classList.add('incorreta');
      todasCorretas = false;
    }
  });

  if (todasCorretas) {
    mostrarFeedback('Resposta correta!', true);
    streak++;
    moedas += 10;
    atualizarStreak();
    atualizarMoedas();
    salvarProgresso();
    // Notifica progresso de missão do tipo "ACERTAR_PERGUNTA"
    notificarProgressoMissao('ACERTAR_PERGUNTA');
    setTimeout(() => {
      perguntaAtual++;
      exibirPerguntaAtual();
    }, 1500);
  } else {
    mostrarFeedback('Algumas respostas estão incorretas! Tente novamente.', false);
    streak = 0;
    atualizarStreak();
    aplicarDano();
    setTimeout(() => {
        lacunas.forEach(lacuna => {
            lacuna.classList.remove('incorreta', 'correta');
        });
        document.querySelector('.botao-verificar').disabled = false;
    }, 1500);
  }
}

function aplicarDano() {
  if (vidas <= 0) return;
  vidas--;
  atualizarVidas();
  document.body.classList.add('dano-effect');
  setTimeout(() => document.body.classList.remove('dano-effect'), 500);
  salvarProgresso();
  if (vidas <= 0) {
    iniciarRecargaVidas();
  }
}

// ===============================================
// TELA "GAME OVER" E RECARGA DE VIDAS
// ===============================================
function iniciarRecargaVidas(tempoInicial = TEMPO_TOTAL_RECARGA) {
  if (intervaloRecarga) clearInterval(intervaloRecarga);

  const overlay = document.getElementById('gameOverOverlay');
  const timerElement = document.getElementById('gameOverTimer');

  if(overlay) overlay.classList.remove('hidden');

  let tempoRestante = tempoInicial;

  const atualizarTimerNaTela = () => {
    if(timerElement) timerElement.textContent = formatarTempo(tempoRestante);
  };

  atualizarTimerNaTela();

  intervaloRecarga = setInterval(() => {
    tempoRestante--;
    atualizarTimerNaTela();

    if (tempoRestante <= 0) {
      clearInterval(intervaloRecarga);
      intervaloRecarga = null;
      if(overlay) overlay.classList.add('hidden');
      vidas = 3;
      atualizarVidas();
      salvarProgresso();
    }
  }, 1000);
}


// ===============================================
// RENDERIZAÇÃO E FUNÇÕES ORIGINAIS (PRESERVADAS)
// ===============================================
function formatarTempo(segundos) {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderizarTrilhas() {
  const listaTrilhas = document.getElementById('listaTrilhas');
  if (!listaTrilhas) return;
  listaTrilhas.innerHTML = '';
  Object.values(window.trilhas).forEach(trilha => {
    const trilhaDiv = document.createElement('div');
    trilhaDiv.className = 'trilha-item animated fadeIn';
    trilhaDiv.innerHTML = `
      <div class="trilha-item-header">
        <i class="fas fa-book"></i>
        <h3>${trilha.nome}</h3>
      </div>
      <p class="trilha-desc">${trilha.descricao}</p>
      <button class="botao-trilha pulse-on-hover" data-trilha="${trilha.nome}">
        <i class="fas fa-play"></i> Começar
      </button>
    `;
    listaTrilhas.appendChild(trilhaDiv);
  });
  document.querySelectorAll('.botao-trilha').forEach(botao => {
    botao.addEventListener('click', () => abrirTrilha(botao.getAttribute('data-trilha')));
  });
}

function abrirTrilha(trilhaNome) {
  trilhaAtual = window.trilhas[trilhaNome];
  if (!trilhaAtual) {
    mostrarFeedback('Trilha não encontrada!', false);
    return;
  }
  etapaAtual = 0;
  perguntaAtual = 0;
  const conteudoTrilha = document.getElementById('conteudoTrilha');
  conteudoTrilha.innerHTML = `
    <div class="trilha-header animated fadeIn">
      <h2>${trilhaAtual.nome}</h2>
      <p class="trilha-descricao">${trilhaAtual.descricao}</p>
    </div>
    <div class="etapas-container animated fadeInUp">
      ${trilhaAtual.etapas.map((etapa, index) => `
        <div class="etapa-card ${index === 0 ? 'first' : ''}">
          <div class="etapa-numero">${index + 1}</div>
          <div class="etapa-content">
            <h3><i class="fas fa-tasks"></i> ${etapa.nome}</h3>
            <p>${etapa.descricao}</p>
            <button class="botao-etapa pulse-on-hover" data-etapa="${index}"><i class="fas fa-play"></i> Iniciar</button>
          </div>
        </div>
      `).join('')}
    </div>`;
  document.querySelectorAll('.botao-etapa').forEach(botao => {
    botao.addEventListener('click', () => abrirEtapa(parseInt(botao.getAttribute('data-etapa'))));
  });
}

function abrirEtapa(indiceEtapa) {
  etapaAtual = trilhaAtual.etapas[indiceEtapa];
  perguntaAtual = 0;
  if (!etapaAtual) {
    mostrarFeedback('Etapa não encontrada!', false);
    return;
  }
  exibirPerguntaAtual();
}

function exibirPerguntaAtual() {
  if (vidas <= 0) {
    return;
  }
  const pergunta = etapaAtual.perguntas[perguntaAtual];
  if (!pergunta) {
    exibirResultadoFinal();
    return;
  }
  const conteudoTrilha = document.getElementById('conteudoTrilha');
  conteudoTrilha.innerHTML = `
    <div class="pergunta-header animated fadeIn">
      <div class="progress-container"><div class="progress-bar" style="width: ${(perguntaAtual / etapaAtual.perguntas.length) * 100}%"></div></div>
      <div class="pergunta-info">
        <span class="etapa-nome">${etapaAtual.nome}</span>
        <span class="pergunta-contador">Pergunta ${perguntaAtual + 1} de ${etapaAtual.perguntas.length}</span>
      </div>
    </div>
    <div class="pergunta-container animated fadeInUp" id="perguntaContainer"></div>`;
  const container = document.getElementById('perguntaContainer');
  let opcoes = [];
  try {
    opcoes = typeof pergunta.opcoes === 'string' ? JSON.parse(pergunta.opcoes) : (pergunta.opcoes || []);
  } catch(e) { console.error("Erro ao parsear opções: ", e); }

  if (pergunta.tipo === 'arrastar-palavras') {
    const partes = pergunta.enunciado.split('______');
    container.innerHTML = `
      <div class="enunciado-lacunas">
        ${partes.map((parte, i) => `<span>${parte}</span>
          ${i < partes.length - 1 ? `
            <div class="lacuna-container">
              <span class="lacuna" data-resposta="${pergunta.resposta_correta}">
                <span class="lacuna-placeholder">______</span>
              </span>
            </div>` : ''}
        `).join('')}
      </div>
      <div class="palavras-disponiveis">
        ${opcoes.map(palavra => `<div class="palavra" draggable="true"><span>${palavra}</span></div>`).join('')}
      </div>
      <button class="botao-verificar pulse-on-hover"><i class="fas fa-check"></i> Verificar</button>`;
    configurarArrastarPalavras();
    container.querySelector('.botao-verificar').addEventListener('click', verificarRespostaLacuna);
  } else if (pergunta.tipo === 'multipla-escolha') {
    const respostaCorreta = Array.isArray(pergunta.resposta_correta) ? pergunta.resposta_correta[0] : pergunta.resposta_correta;
    container.innerHTML = `
      <div class="pergunta-multipla-escolha">
        <div class="enunciado"><p>${pergunta.enunciado}</p></div>
        <div class="opcoes-resposta">
          ${opcoes.map((opcao, index) => `
            <button class="opcao pulse-on-hover" data-opcao="${opcao}">
              <span class="opcao-indice">${String.fromCharCode(65 + index)}</span>
              <span class="opcao-texto">${opcao}</span>
            </button>
          `).join('')}
        </div>
      </div>`;
    container.querySelectorAll('.opcao').forEach(botao => {
      botao.addEventListener('click', () => verificarRespostaMultiplaEscolha(botao.getAttribute('data-opcao') === respostaCorreta));
    });
  }
}

function configurarArrastarPalavras() {
  const palavras = document.querySelectorAll('.palavra');
  const lacunas = document.querySelectorAll('.lacuna');
  palavras.forEach(palavra => {
    palavra.addEventListener('dragstart', (e) => {
      arrastandoPalavra = palavra.textContent.trim();
      e.dataTransfer.setData('text/plain', arrastandoPalavra);
      palavra.classList.add('dragging');
      setTimeout(() => palavra.classList.add('invisivel'), 0);
    });
    palavra.addEventListener('dragend', () => palavra.classList.remove('dragging', 'invisivel'));
  });
  lacunas.forEach(lacuna => {
    lacuna.addEventListener('dragover', (e) => { e.preventDefault(); lacuna.classList.add('lacuna-hover'); });
    lacuna.addEventListener('dragleave', () => lacuna.classList.remove('lacuna-hover'));
    lacuna.addEventListener('drop', (e) => {
      e.preventDefault();
      lacuna.classList.remove('lacuna-hover');
      const palavraArrastada = e.dataTransfer.getData('text/plain').trim();
      lacuna.innerHTML = `<span class="palavra-preenchida">${palavraArrastada}</span>`;
      lacuna.dataset.preenchido = palavraArrastada;
    });
  });
}

function exibirResultadoFinal() {
  const conteudoTrilha = document.getElementById('conteudoTrilha');
  conteudoTrilha.innerHTML = `
    <div class="resultado-final animated fadeIn">
      <div class="resultado-content">
        <div class="resultado-icon"><i class="fas fa-trophy"></i></div>
        <h2>Etapa Concluída!</h2>
        <p class="resultado-mensagem">Você completou a etapa "${etapaAtual.nome}" com sucesso!</p>
        <button class="botao-voltar pulse-on-hover" onclick="abrirTrilha('${trilhaAtual.nome}')">
          <i class="fas fa-arrow-left"></i> Voltar para a Trilha
        </button>
      </div>
    </div>`;

  // Notifica que uma lição foi concluída para a missão
  notificarProgressoMissao('CONCLUIR_LICAO');
}

function mostrarFeedback(mensagem, sucesso) {
  const feedback = document.createElement('div');
  feedback.className = `feedback animated fadeInDown ${sucesso ? 'sucesso' : 'erro'}`;
  feedback.innerHTML = `<i class="fas ${sucesso ? 'fa-check-circle' : 'fa-times-circle'}"></i><span>${mensagem}</span>`;
  document.body.appendChild(feedback);
  setTimeout(() => {
    feedback.classList.add('fadeOutUp');
    setTimeout(() => feedback.remove(), 500);
  }, 3000); // Aumentado para 3 segundos para dar tempo de ler a recompensa
}