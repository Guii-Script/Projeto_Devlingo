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
const TEMPO_TOTAL_RECARGA = 60; // 60 segundos


// ===============================================
// INICIALIZAÇÃO
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  carregarEstadoInicial();
  carregarTrilhas();
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
  // Pega o tempo de recarga que veio do servidor
  const tempoRecargaServidor = statusContainer.getAttribute('data-tempo-recarga');

  atualizarVidas();
  atualizarStreak();
  atualizarMoedas();

  // **LÓGICA DO TIMER PERSISTENTE**
  if (vidas <= 0 && tempoRecargaServidor) {
    // Converte o tempo do servidor para um objeto de Data do Javascript
    const tempoInicio = new Date(tempoRecargaServidor.replace(' ', 'T'));
    const agora = new Date();
    
    // Calcula quantos segundos se passaram desde que as vidas acabaram
    const segundosPassados = Math.floor((agora - tempoInicio) / 1000);
    const segundosRestantes = TEMPO_TOTAL_RECARGA - segundosPassados;

    if (segundosRestantes > 0) {
      // Se o timer ainda não acabou, inicia a contagem de onde parou
      iniciarRecargaVidas(segundosRestantes);
    } else {
      // Se o timer já acabou enquanto o usuário estava fora, restaura as vidas
      vidas = 3;
      atualizarVidas();
      salvarProgresso(); // Informa o servidor que as vidas foram restauradas
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

// ESTA É A VERSÃO CORRETA DA FUNÇÃO, FORA DE QUALQUER OUTRA FUNÇÃO
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
        <i class="fas fa-${trilha.icone || 'book'}"></i>
        <h3>${trilha.nome}</h3>
      </div>
      <p class="trilha-desc">${trilha.descricao}</p>
      <div class="trilha-meta">
        <span class="trilha-dificuldade ${trilha.dificuldade || 'Iniciante'}">
          <i class="fas fa-${(trilha.dificuldade === 'Iniciante' ? 'seedling' : trilha.dificuldade === 'Intermediário' ? 'chart-line' : 'fire') || 'seedling'}"></i> ${trilha.dificuldade || 'Iniciante'}
        </span>
        <span class="trilha-tempo"><i class="far fa-clock"></i> ${trilha.duracao || '30min'}</span>
      </div>
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
      <div class="trilha-breadcrumb">
        <span class="trilha-nome">${trilhaAtual.nome}</span>
        <i class="fas fa-chevron-right"></i>
        <span class="etapa-atual">Etapas</span>
      </div>
      <h2>${trilhaAtual.nome}</h2>
      <p class="trilha-descricao">${trilhaAtual.descricao}</p>
      <div class="trilha-stats">
        <div class="stat-item"><i class="fas fa-layer-group"></i><span>${trilhaAtual.etapas.length} Etapas</span></div>
        <div class="stat-item"><i class="fas fa-question-circle"></i><span>${trilhaAtual.etapas.reduce((acc, etapa) => acc + (etapa.perguntas ? etapa.perguntas.length : 0), 0)} Perguntas</span></div>
        <div class="stat-item"><i class="fas fa-award"></i><span>${trilhaAtual.xp || 100} XP</span></div>
      </div>
    </div>
    <div class="etapas-container animated fadeInUp">
      ${trilhaAtual.etapas.map((etapa, index) => `
        <div class="etapa-card ${index === 0 ? 'first' : ''} ${index === trilhaAtual.etapas.length - 1 ? 'last' : ''}">
          <div class="etapa-numero">${index + 1}</div>
          <div class="etapa-content">
            <h3><i class="fas fa-${etapa.icone || 'tasks'}"></i> ${etapa.nome}</h3>
            <p>${etapa.descricao}</p>
            <div class="etapa-meta">
              <span><i class="fas fa-question"></i> ${etapa.perguntas ? etapa.perguntas.length : 0} perguntas</span>
              <span><i class="fas fa-star"></i> ${etapa.dificuldade || 'Médio'}</span>
            </div>
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
    // A tela de GAME OVER já estará ativa, então não renderiza a pergunta.
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
              <span class="lacuna-indice">${i + 1}</span>
            </div>` : ''}
        `).join('')}
      </div>
      <div class="palavras-disponiveis">
        ${opcoes.map(palavra => `<div class="palavra" draggable="true"><i class="fas fa-grip-vertical"></i><span>${palavra}</span></div>`).join('')}
      </div>
      <button class="botao-verificar pulse-on-hover"><i class="fas fa-check"></i> Verificar Resposta</button>`;
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
              <i class="fas fa-check opcao-correta"></i>
              <i class="fas fa-times opcao-incorreta"></i>
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
        <div class="resultado-stats">
          <div class="stat-item">
            <i class="fas fa-check-circle"></i>
            <span>${etapaAtual.perguntas.length} de ${etapaAtual.perguntas.length} perguntas</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-star"></i>
            <span>${etapaAtual.perguntas.length * 10} XP ganhos</span>
          </div>
        </div>
        <button class="botao-voltar pulse-on-hover" onclick="abrirTrilha('${trilhaAtual.nome}')">
          <i class="fas fa-arrow-left"></i> Voltar para a Trilha
        </button>
      </div>
    </div>`;
}

function mostrarFeedback(mensagem, sucesso) {
  const feedback = document.createElement('div');
  feedback.className = `feedback animated fadeInDown ${sucesso ? 'sucesso' : 'erro'}`;
  feedback.innerHTML = `<i class="fas ${sucesso ? 'fa-check-circle' : 'fa-times-circle'}"></i><span>${mensagem}</span>`;
  document.body.appendChild(feedback);
  setTimeout(() => {
    feedback.classList.add('fadeOutUp');
    setTimeout(() => feedback.remove(), 500);
  }, 2000);
}