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
const TEMPO_TOTAL_RECARGA = 300; // 5 minutos em segundos (5 * 60)


// ===============================================
// INICIALIZAÇÃO
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  carregarEstadoInicial();
  carregarTrilhas();
  // A chamada para carregar missões foi removida daqui.
});


// ===============================================
// LÓGICA DE CONQUISTAS E FEEDBACK
// ===============================================

/**
 * Envia um evento para o servidor para verificar se alguma conquista foi desbloqueada.
 * @param {string} evento - O tipo de evento (ex: 'ACERTOU_RESPOSTA').
 * @param {object} detalhes - Dados adicionais sobre o evento.
 */
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

function mostrarFeedback(mensagem, sucesso) {
  const feedback = document.createElement('div');
  feedback.className = `feedback animated fadeInDown ${sucesso ? 'sucesso' : 'erro'}`;
  feedback.innerHTML = `<i class="fas ${sucesso ? 'fa-check-circle' : 'fa-times-circle'}"></i><span>${mensagem}</span>`;
  document.body.appendChild(feedback);
  setTimeout(() => {
    feedback.classList.add('fadeOutUp');
    setTimeout(() => feedback.remove(), 500);
  }, 3000);
}


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
    if (!response.ok) throw new Error('Erro ao buscar dados do servidor');
    const trilhasDoBanco = await response.json();

    window.trilhas = trilhasDoBanco.reduce((acc, trilha) => {
      acc[trilha.nome] = trilha;
      return acc;
    }, {});

    renderizarMenuTrilhas();
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

// A seção "LÓGICA DE MISSÕES" foi completamente removida.

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
  const opcaoSelecionada = event.currentTarget;
  document.querySelectorAll('.opcao').forEach(btn => btn.disabled = true);

  if (correta) {
    opcaoSelecionada.classList.add('correta');
    mostrarFeedback('Resposta correta!', true);
    streak++;
    moedas += 10;
    salvarProgresso();
    verificarConquistas('ACERTOU_RESPOSTA');
    setTimeout(() => {
      perguntaAtual++;
      renderizarPerguntaAtual();
    }, 1500);
  } else {
    opcaoSelecionada.classList.add('incorreta');
    mostrarFeedback('Resposta incorreta!', false);
    streak = 0;
    aplicarDano();
    const detalhes = { pergunta_ordem: perguntaAtual + 1 };
    verificarConquistas('ERROU_RESPOSTA', detalhes);

    if (opcaoSelecionadaTexto === 'Boas Práticas') {
        verificarConquistas('ESCOLHEU_BOAS_PRATICAS');
    }

    setTimeout(() => {
      opcaoSelecionada.classList.remove('incorreta');
      document.querySelectorAll('.opcao').forEach(btn => btn.disabled = false);
    }, 1500);
  }
  atualizarUIStatus();
}

function verificarRespostaArrastar() {
    const lacunas = document.querySelectorAll('.lacuna');
    let todasCorretas = true;
    document.querySelector('.botao-verificar').disabled = true;

    lacunas.forEach(lacuna => {
        const palavraPreenchida = lacuna.querySelector('.palavra');
        const respostaUsuario = palavraPreenchida ? palavraPreenchida.textContent.trim() : '';
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
        salvarProgresso();
        verificarConquistas('ACERTOU_RESPOSTA');
        setTimeout(() => {
          perguntaAtual++;
          renderizarPerguntaAtual();
        }, 1500);
    } else {
        mostrarFeedback('Algumas respostas estão incorretas!', false);
        streak = 0;
        aplicarDano();
        const detalhes = { pergunta_ordem: perguntaAtual + 1 };
        verificarConquistas('ERROU_RESPOSTA', detalhes);
        setTimeout(() => {
            lacunas.forEach(l => {
                l.classList.remove('correta', 'incorreta', 'preenchida');
                const palavra = l.querySelector('.palavra');
                if (palavra) {
                    document.querySelector('.palavras-disponiveis').appendChild(palavra);
                }
            });
            document.querySelector('.botao-verificar').disabled = false;
        }, 1500);
    }
    atualizarUIStatus();
}

function aplicarDano() {
  if (vidas <= 0) return;
  vidas--;
  atualizarUIStatus();
  salvarProgresso();
  document.body.classList.add('dano-effect');
  setTimeout(() => document.body.classList.remove('dano-effect'), 500);
  if (vidas <= 0) {
    verificarConquistas('PERDEU_TODAS_AS_VIDAS');
    iniciarRecargaVidas();
  }
}

// ===============================================
// TELA "GAME OVER" E RECARGA DE VIDAS
// ===============================================
function iniciarRecargaVidas(tempoInicial = TEMPO_TOTAL_RECARGA) {
  if (intervaloRecarga) clearInterval(intervaloRecarga);

  const overlay = document.getElementById('overlay-game-over');
  const timerEl = document.getElementById('timer-game-over');
  
  if (overlay) overlay.classList.remove('escondido');

  let tempoRestante = tempoInicial;
  
  const formatarTempo = (s) => {
      const mins = Math.floor(s / 60).toString().padStart(2, '0');
      const secs = (s % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
  };
  
  if(timerEl) timerEl.textContent = formatarTempo(tempoRestante);
  
  intervaloRecarga = setInterval(() => {
    tempoRestante--;
    if (timerEl) timerEl.textContent = formatarTempo(tempoRestante);
    if (tempoRestante <= 0) {
      clearInterval(intervaloRecarga);
      intervaloRecarga = null;
      if (overlay) overlay.classList.add('escondido');
      vidas = 3;
      atualizarUIStatus();
      salvarProgresso();
      renderizarPerguntaAtual(); 
    }
  }, 1000);
}



// ===============================================
// RENDERIZAÇÃO DE CONTEÚDO
// ===============================================
function renderizarMenuTrilhas() {
  const lista = document.getElementById('lista-trilhas');
  const container = document.getElementById('conteudo-trilha');
  if (!lista) return;

  lista.innerHTML = Object.values(window.trilhas).map(t => `
    <div class="item-trilha">
      <div class="cabecalho-item-trilha"><i class="fas fa-book"></i><h3>${t.nome}</h3></div>
      <p class="descricao-trilha">${t.descricao}</p>
      <button class="botao-trilha" data-trilha-nome="${t.nome}"><i class="fas fa-play"></i> Começar</button>
    </div>`).join('');

  document.querySelectorAll('.botao-trilha').forEach(b => 
    b.addEventListener('click', () => abrirTrilha(b.dataset.trilhaNome))
  );
  
  if(container) container.innerHTML = '<h2><i class="fas fa-arrow-left"></i> Selecione uma trilha ao lado para começar!</h2>';
}

function abrirTrilha(nomeTrilha) {
  trilhaAtual = window.trilhas[nomeTrilha];
  etapaAtual = 0;
  perguntaAtual = 0;
  
  const container = document.getElementById('conteudo-trilha');
  if (!container || !trilhaAtual) return;

  container.innerHTML = `
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
            <button class="botao-etapa" data-etapa-index="${index}"><i class="fas fa-play"></i> Iniciar Etapa</button>
          </div>
        </div>
      `).join('')}
    </div>`;

  document.querySelectorAll('.botao-etapa').forEach(botao => {
    botao.addEventListener('click', () => {
      etapaAtual = parseInt(botao.dataset.etapaIndex, 10);
      perguntaAtual = 0;
      renderizarPerguntaAtual();
    });
  });
}

function renderizarPerguntaAtual() {
  const container = document.getElementById('conteudo-trilha');
  if (!container) return;
  
  if (vidas <= 0) {
    return;
  }

  if (!trilhaAtual) {
    renderizarMenuTrilhas();
    return;
  }
  
  const etapa = trilhaAtual.etapas[etapaAtual];
  if (!etapa) { // Terminou todas as etapas
    container.innerHTML = `<div class="resultado-final">
      <div class="resultado-icon"><i class="fas fa-trophy"></i></div>
      <h2>Trilha Concluída!</h2>
      <p>Parabéns, você completou a trilha "${trilhaAtual.nome}"!</p>
      <button class="botao-voltar" onclick="renderizarMenuTrilhas()"><i class="fas fa-list-ul"></i> Voltar ao Menu</button>
    </div>`;
    return;
  }

  const pergunta = etapa.perguntas[perguntaAtual];
  if (!pergunta) { // Terminou as perguntas da etapa atual
    etapaAtual++;
    perguntaAtual = 0;
    abrirTrilha(trilhaAtual.nome);
    mostrarFeedback(`Etapa "${etapa.nome}" concluída!`, true);
    return;
  }

  let html = `<div class="cabecalho-pergunta">
      <button class="botao-voltar-etapa" onclick="abrirTrilha('${trilhaAtual.nome}')"><i class="fas fa-arrow-left"></i> Voltar</button>
      <div class="container-progresso"><div class="barra-progresso" style="width:${(perguntaAtual / etapa.perguntas.length) * 100}%"></div></div>
      <div class="info-pergunta"><span>${etapa.nome}</span><span>Pergunta ${perguntaAtual + 1} de ${etapa.perguntas.length}</span></div>
    </div>`;

  if (pergunta.tipo === 'multipla-escolha') {
    html += `<div class="enunciado">${pergunta.enunciado}</div>
      <div class="opcoes-resposta">
        ${pergunta.opcoes.map(op => `<button class="opcao" onclick="verificarRespostaMultiplaEscolha(${op === pergunta.resposta_correta}, '${op.replace(/'/g, "\\'")}')">${op}</button>`).join('')}
      </div>`;
  } else if (pergunta.tipo === 'arrastar-palavras') {
    
    const respostasCorretas = Array.isArray(pergunta.resposta_correta) ? pergunta.resposta_correta : [pergunta.resposta_correta];

    const partes = pergunta.enunciado.split('______');
    html += `<div class="enunciado-arrastar">
        ${partes.map((p, i) => {
          if (i < partes.length - 1) {
            return `${p} <span class="lacuna" data-resposta="${respostasCorretas[i]}"></span>`;
          }
          return p;
        }).join('')}
      </div>
      <div class="palavras-disponiveis">
        ${pergunta.opcoes.map(op => `<div class="palavra" draggable="true">${op}</div>`).join('')}
      </div>
      <button class="botao-verificar">Verificar</button>`;
  }

  container.innerHTML = html;

  if (pergunta.tipo === 'arrastar-palavras') {
    configurarArrastarPalavras();
    container.querySelector('.botao-verificar').addEventListener('click', verificarRespostaArrastar);
  }
}

function configurarArrastarPalavras() {
    const palavras = document.querySelectorAll('.palavra');
    const lacunas = document.querySelectorAll('.lacuna');
    const areaPalavras = document.querySelector('.palavras-disponiveis');
    let palavraArrastada = null;
    let lacunaOrigem = null;

    palavras.forEach(p => {
        p.addEventListener('dragstart', (e) => {
            palavraArrastada = p;
            if (p.parentElement.classList.contains('lacuna')) {
                lacunaOrigem = p.parentElement;
                lacunaOrigem.classList.remove('preenchida');
            }
            setTimeout(() => p.style.display = 'none', 0);
        });
        p.addEventListener('dragend', () => {
            setTimeout(() => {
                if(palavraArrastada) {
                  palavraArrastada.style.display = 'inline-block';
                  palavraArrastada = null;
                  lacunaOrigem = null;
                }
            }, 0);
        });
    });

    lacunas.forEach(l => {
        l.addEventListener('dragover', (e) => e.preventDefault());
        l.addEventListener('drop', () => {
            if (l.children.length === 0 && palavraArrastada) {
                l.appendChild(palavraArrastada);
                l.classList.add('preenchida');
            }
        });
    });
    
    if (areaPalavras) {
        areaPalavras.addEventListener('dragover', e => e.preventDefault());
        areaPalavras.addEventListener('drop', () => {
            if (palavraArrastada) {
                areaPalavras.appendChild(palavraArrastada);
                if (lacunaOrigem) {
                    lacunaOrigem.classList.remove('preenchida');
                }
            }
        });
    }
}