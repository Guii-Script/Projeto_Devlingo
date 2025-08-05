// JS/trilhas.js

// ===============================================
// VARIÁVEIS GLOBAIS
// ===============================================
let trilhaAtual = null;
let etapaAtual = null;
let perguntaAtual = 0;
let arrastandoPalavra = null;
let vidas = 3;
let streak = 0;
let moedas = 0;
let intervaloRecarga = null;
const TEMPO_TOTAL_RECARGA = 300; // 5 minutos em segundos

// ===============================================
// INICIALIZAÇÃO
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  carregarEstadoInicial();
  carregarTrilhas();
  // carregarMissoesDiarias(); // Descomente se for usar o sistema de missões
});

// ===============================================
// LÓGICA DE CONQUISTAS
// ===============================================
async function verificarConquistas(evento, detalhes = {}) {
    try {
        await fetch('verificar_conquista.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ evento, detalhes }),
        });
    } catch (error) {
        console.error('Erro ao verificar conquistas:', error);
    }
}

function mostrarNotificacaoConquista(icone, nome, descricao) {
    const container = document.getElementById('notificacao-container');
    if (!container) return;
    container.innerHTML = `
        <div class="notificacao-conquista" id="notificacao-toast">
            <div class="notificacao-conquista-icone"><img src="${icone}" style="width: 40px; height: 40px;"></div>
            <div class="notificacao-conquista-conteudo">
                <h4>${nome}</h4>
                <p>${descricao}</p>
            </div>
        </div>`;
    setTimeout(() => document.getElementById('notificacao-toast').classList.add('visivel'), 10);
    setTimeout(() => document.getElementById('notificacao-toast').classList.remove('visivel'), 5000);
}

// ===============================================
// CARREGAMENTO E ESTADO DO JOGO
// ===============================================
function carregarEstadoInicial() {
  const containerStatus = document.querySelector('.status-jogador');
  if (!containerStatus) return;

  vidas = parseInt(containerStatus.getAttribute('data-vidas'), 10);
  streak = parseInt(containerStatus.getAttribute('data-streak'), 10);
  moedas = parseInt(containerStatus.getAttribute('data-moedas'), 10);
  const tempoRecargaServidor = containerStatus.getAttribute('data-tempo-recarga');

  atualizarUIStatus();

  if (vidas <= 0 && tempoRecargaServidor) {
    const tempoInicio = new Date(tempoRecargaServidor.replace(' ', 'T'));
    const agora = new Date();
    const segundosPassados = Math.floor((agora - tempoInicio) / 1000);
    const segundosRestantes = TEMPO_TOTAL_RECARGA - segundosPassados;

    if (segundosRestantes > 0) {
      iniciarRecargaVidas(segundosRestantes);
    } else {
      vidas = 3;
      atualizarUIStatus();
      salvarProgresso();
    }
  }
}

async function carregarTrilhas() {
  try {
    const response = await fetch('conexao.php');
    const trilhasDoBanco = await response.json();
    window.trilhas = trilhasDoBanco.reduce((acc, trilha) => {
      acc[trilha.nome] = trilha;
      return acc;
    }, {});
    renderizarMenuTrilhas();
  } catch (error) {
    console.error('Erro ao carregar trilhas:', error);
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
function atualizarUIStatus() {
  document.getElementById('vidas').textContent = vidas;
  document.getElementById('streak').textContent = streak;
  document.getElementById('moedas').textContent = moedas;
}

// ===============================================
// LÓGICA DE JOGO E RESPOSTAS
// ===============================================
function verificarRespostaMultiplaEscolha(correta, opcaoSelecionadaTexto) {
  const botaoSelecionado = event.currentTarget;
  document.querySelectorAll('.opcao').forEach(btn => btn.disabled = true);

  if (correta) {
    botaoSelecionado.classList.add('correta');
    mostrarFeedback('Resposta correta!', 'sucesso');
    streak++;
    moedas += 10;
    verificarConquistas('ACERTOU_RESPOSTA');
    setTimeout(() => {
      perguntaAtual++;
      renderizarPerguntaAtual();
    }, 1500);
  } else {
    botaoSelecionado.classList.add('incorreta');
    mostrarFeedback('Resposta incorreta!', 'erro');
    streak = 0;
    aplicarDano();
    verificarConquistas('ERROU_RESPOSTA', { pergunta_ordem: perguntaAtual + 1 });
    if (opcaoSelecionadaTexto === 'Boas Práticas') {
        verificarConquistas('ESCOLHEU_BOAS_PRATICAS');
    }
    setTimeout(() => {
      botaoSelecionado.classList.remove('incorreta');
      document.querySelectorAll('.opcao').forEach(btn => btn.disabled = false);
    }, 1500);
  }
  atualizarUIStatus();
  salvarProgresso();
}

function aplicarDano() {
  if (vidas > 0) {
    vidas--;
    if (vidas <= 0) {
      verificarConquistas('PERDEU_TODAS_AS_VIDAS');
      iniciarRecargaVidas();
    }
  }
}

function iniciarRecargaVidas(tempoInicial = TEMPO_TOTAL_RECARGA) {
  const overlay = document.getElementById('overlay-game-over');
  const timerElemento = document.getElementById('timer-game-over');
  if (overlay) overlay.classList.remove('escondido');

  let tempoRestante = tempoInicial;
  intervaloRecarga = setInterval(() => {
    tempoRestante--;
    const mins = Math.floor(tempoRestante / 60).toString().padStart(2, '0');
    const secs = (tempoRestante % 60).toString().padStart(2, '0');
    if (timerElemento) timerElemento.textContent = `${mins}:${secs}`;

    if (tempoRestante <= 0) {
      clearInterval(intervaloRecarga);
      if (overlay) overlay.classList.add('escondido');
      vidas = 3;
      atualizarUIStatus();
      salvarProgresso();
    }
  }, 1000);
}

// ===============================================
// RENDERIZAÇÃO DE CONTEÚDO
// ===============================================
function renderizarMenuTrilhas() {
  const listaTrilhas = document.getElementById('lista-trilhas');
  if (!listaTrilhas) return;
  listaTrilhas.innerHTML = '';
  Object.values(window.trilhas).forEach(trilha => {
    const div = document.createElement('div');
    div.className = 'item-trilha';
    div.innerHTML = `
      <div class="cabecalho-item-trilha"><i class="fas fa-book"></i><h3>${trilha.nome}</h3></div>
      <p class="descricao-trilha">${trilha.descricao}</p>
      <button class="botao-trilha" data-trilha-nome="${trilha.nome}"><i class="fas fa-play"></i> Começar</button>`;
    listaTrilhas.appendChild(div);
  });
  document.querySelectorAll('.botao-trilha').forEach(botao => {
    botao.addEventListener('click', () => abrirTrilha(botao.dataset.trilhaNome));
  });
}

function abrirTrilha(nomeTrilha) {
  trilhaAtual = window.trilhas[nomeTrilha];
  etapaAtual = 0;
  perguntaAtual = 0;
  renderizarPerguntaAtual();
}

function renderizarPerguntaAtual() {
  const container = document.getElementById('conteudo-trilha');
  if (vidas <= 0 || !trilhaAtual) {
    container.innerHTML = '<h2>Selecione uma trilha para começar.</h2>';
    return;
  }
  
  const pergunta = trilhaAtual.etapas[etapaAtual]?.perguntas[perguntaAtual];

  if (!pergunta) {
    container.innerHTML = `<h2>Etapa concluída!</h2>`;
    return;
  }

  let htmlPergunta = `
    <div class="cabecalho-pergunta">
      <div class="container-progresso"><div class="barra-progresso" style="width: ${(perguntaAtual / trilhaAtual.etapas[etapaAtual].perguntas.length) * 100}%"></div></div>
      <div class="info-pergunta"><span>${trilhaAtual.etapas[etapaAtual].nome}</span><span>Pergunta ${perguntaAtual + 1}</span></div>
    </div>
    <div class="enunciado">${pergunta.enunciado}</div>
    <div class="opcoes-resposta">`;
  
  pergunta.opcoes.forEach(opcao => {
    const ehCorreta = opcao === pergunta.resposta_correta;
    htmlPergunta += `<button class="opcao" onclick="verificarRespostaMultiplaEscolha(${ehCorreta ? 'true' : 'false'}, '${opcao.replace(/'/g, "\\'")}')">${opcao}</button>`;
  });

  htmlPergunta += '</div>';
  container.innerHTML = htmlPergunta;
}

function mostrarFeedback(mensagem, tipo) {
  const feedback = document.createElement('div');
  feedback.className = `feedback ${tipo}`;
  feedback.textContent = mensagem;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 3000);
}
