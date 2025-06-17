let trilhaAtual = null;
let etapaAtual = null;
let perguntaAtual = 0;
let arrastandoPalavra = null;

// Função para carregar trilhas do banco de dados
async function carregarTrilhas() {
  try {
    const response = await fetch('/Projeto_Devlingo/conexao.php');
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

// Função para renderizar as trilhas no menu lateral
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
        <span class="trilha-dificuldade ${trilha.dificuldade}">
          <i class="fas fa-${trilha.dificuldade === 'Iniciante' ? 'seedling' : 
                             trilha.dificuldade === 'Intermediário' ? 'chart-line' : 
                             'fire'}"></i> ${trilha.dificuldade}
        </span>
        <span class="trilha-tempo"><i class="far fa-clock"></i> ${trilha.duracao || '30min'}</span>
      </div>
      <button class="botao-trilha pulse-on-hover" data-trilha="${trilha.nome}">
        <i class="fas fa-play"></i> Começar
      </button>
    `;
    listaTrilhas.appendChild(trilhaDiv);
  });

  // Adiciona eventos aos botões
  document.querySelectorAll('.botao-trilha').forEach(botao => {
    botao.addEventListener('click', () => {
      abrirTrilha(botao.getAttribute('data-trilha'));
    });
  });
}

// Função para abrir uma trilha específica
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
        <div class="stat-item">
          <i class="fas fa-layer-group"></i>
          <span>${trilhaAtual.etapas.length} Etapas</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-question-circle"></i>
          <span>${trilhaAtual.etapas.reduce((acc, etapa) => acc + etapa.perguntas.length, 0)} Perguntas</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-award"></i>
          <span>${trilhaAtual.xp || 100} XP</span>
        </div>
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
              <span><i class="fas fa-question"></i> ${etapa.perguntas.length} perguntas</span>
              <span><i class="fas fa-star"></i> ${etapa.dificuldade || 'Médio'}</span>
            </div>
            <button class="botao-etapa pulse-on-hover" data-etapa="${index}">
              <i class="fas fa-play"></i> Iniciar
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Adiciona eventos aos botões das etapas
  document.querySelectorAll('.botao-etapa').forEach(botao => {
    botao.addEventListener('click', () => {
      abrirEtapa(parseInt(botao.getAttribute('data-etapa')));
    });
  });
}

// Função para abrir uma etapa específica
function abrirEtapa(indiceEtapa) {
  etapaAtual = trilhaAtual.etapas[indiceEtapa];
  perguntaAtual = 0;

  if (!etapaAtual) {
    mostrarFeedback('Etapa não encontrada!', false);
    return;
  }

  exibirPerguntaAtual();
}

// Função principal que exibe a pergunta atual
function exibirPerguntaAtual() {
  const pergunta = etapaAtual.perguntas[perguntaAtual];
  if (!pergunta) {
    exibirResultadoFinal();
    return;
  }

  const conteudoTrilha = document.getElementById('conteudoTrilha');
  conteudoTrilha.innerHTML = `
    <div class="pergunta-header animated fadeIn">
      <div class="progress-container">
        <div class="progress-bar" style="width: ${(perguntaAtual / etapaAtual.perguntas.length) * 100}%"></div>
      </div>
      <div class="pergunta-info">
        <span class="etapa-nome">${etapaAtual.nome}</span>
        <span class="pergunta-contador">Pergunta ${perguntaAtual + 1} de ${etapaAtual.perguntas.length}</span>
      </div>
    </div>
    <div class="pergunta-container animated fadeInUp" id="perguntaContainer"></div>
  `;

  const container = document.getElementById('perguntaContainer');

  // Parse das opções (suporta JSON string ou array direto)
  let opcoes = [];
  try {
    opcoes = typeof pergunta.opcoes === 'string' ? 
             JSON.parse(pergunta.opcoes) : 
             pergunta.opcoes || [];
  } catch (e) {
    console.error('Erro ao parsear opções:', e);
    opcoes = [];
  }

  // Sistema de Lacunas
  if (pergunta.tipo === 'arrastar-palavras') {
    const partes = pergunta.enunciado.split('______');
    
    container.innerHTML = `
      <div class="enunciado-lacunas">
        ${partes.map((parte, i) => `
          <span>${parte}</span>
          ${i < partes.length - 1 ? `
            <div class="lacuna-container">
              <span class="lacuna" data-resposta="${pergunta.resposta_correta}">
                <span class="lacuna-placeholder">______</span>
              </span>
              <span class="lacuna-indice">${i + 1}</span>
            </div>
          ` : ''}
        `).join('')}
      </div>
      <div class="palavras-disponiveis">
        ${opcoes.map(palavra => `
          <div class="palavra" draggable="true">
            <i class="fas fa-grip-vertical"></i>
            <span>${palavra}</span>
          </div>
        `).join('')}
      </div>
      <button class="botao-verificar pulse-on-hover">
        <i class="fas fa-check"></i> Verificar Resposta
      </button>
    `;

    // Configura drag and drop
    configurarArrastarPalavras();

    // Botão de verificação
    container.querySelector('.botao-verificar').addEventListener('click', verificarRespostaLacuna);

  } 
  // Sistema de Múltipla Escolha
  else if (pergunta.tipo === 'multipla-escolha') {
    container.innerHTML = `
      <div class="pergunta-multipla-escolha">
        <div class="enunciado">
          <p>${pergunta.enunciado}</p>
        </div>
        <div class="opcoes-resposta">
          ${opcoes.map(opcao => `
            <button class="opcao pulse-on-hover" data-opcao="${opcao}">
              <span class="opcao-indice">${String.fromCharCode(65 + opcoes.indexOf(opcao))}</span>
              <span class="opcao-texto">${opcao}</span>
              <i class="fas fa-check opcao-correta"></i>
              <i class="fas fa-times opcao-incorreta"></i>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Adiciona eventos às opções
    container.querySelectorAll('.opcao').forEach(botao => {
      botao.addEventListener('click', () => {
        verificarRespostaMultiplaEscolha(
          botao.getAttribute('data-opcao') === pergunta.resposta_correta
        );
      });
    });
  }
}

// Configura o sistema de arrastar palavras para lacunas
function configurarArrastarPalavras() {
  const palavras = document.querySelectorAll('.palavra');
  const lacunas = document.querySelectorAll('.lacuna');

  palavras.forEach(palavra => {
    palavra.addEventListener('dragstart', (e) => {
      arrastandoPalavra = palavra.textContent.trim();
      e.dataTransfer.setData('text/plain', palavra.textContent);
      palavra.classList.add('dragging');
      setTimeout(() => palavra.classList.add('invisivel'), 0);
    });

    palavra.addEventListener('dragend', () => {
      palavra.classList.remove('dragging', 'invisivel');
    });
  });

  lacunas.forEach(lacuna => {
    lacuna.addEventListener('dragover', (e) => {
      e.preventDefault();
      lacuna.classList.add('lacuna-hover');
    });

    lacuna.addEventListener('dragleave', () => {
      lacuna.classList.remove('lacuna-hover');
    });

    lacuna.addEventListener('drop', (e) => {
      e.preventDefault();
      lacuna.classList.remove('lacuna-hover');
      
      const palavraArrastada = e.dataTransfer.getData('text/plain').trim();
      lacuna.innerHTML = `<span class="palavra-preenchida">${palavraArrastada}</span>`;
      lacuna.dataset.preenchido = palavraArrastada;
    });
  });
}

// Verifica as respostas do tipo lacuna
function verificarRespostaLacuna() {
  const lacunas = document.querySelectorAll('.lacuna');
  let todasCorretas = true;

  lacunas.forEach(lacuna => {
    const respostaUsuario = lacuna.dataset.preenchido;
    const respostaCorreta = lacuna.dataset.resposta;

    if (respostaUsuario && respostaUsuario.toLowerCase() === respostaCorreta.toLowerCase()) {
      lacuna.classList.add('correta');
      lacuna.classList.remove('incorreta');
    } else {
      lacuna.classList.add('incorreta');
      lacuna.classList.remove('correta');
      todasCorretas = false;
    }
  });

  if (todasCorretas) {
    mostrarFeedback('Resposta correta!', true);
    setTimeout(() => {
      perguntaAtual++;
      exibirPerguntaAtual();
    }, 1500);
  } else {
    mostrarFeedback('Algumas respostas estão incorretas!', false);
  }
}

// Verifica respostas de múltipla escolha
function verificarRespostaMultiplaEscolha(correta) {
  const opcaoSelecionada = event.currentTarget;
  
  if (correta) {
    opcaoSelecionada.classList.add('correta');
    mostrarFeedback('Resposta correta!', true);
    setTimeout(() => {
      perguntaAtual++;
      exibirPerguntaAtual();
    }, 1500);
  } else {
    opcaoSelecionada.classList.add('incorreta');
    mostrarFeedback('Resposta incorreta! Tente novamente.', false);
  }
}

// Exibe o resultado final da etapa
function exibirResultadoFinal() {
  const conteudoTrilha = document.getElementById('conteudoTrilha');
  conteudoTrilha.innerHTML = `
    <div class="resultado-final animated fadeIn">
      <div class="resultado-content">
        <div class="resultado-icon">
          <i class="fas fa-trophy"></i>
        </div>
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
    </div>
  `;
}

// Mostra feedback visual
function mostrarFeedback(mensagem, sucesso) {
  const feedback = document.createElement('div');
  feedback.className = `feedback animated fadeInDown ${sucesso ? 'sucesso' : 'erro'}`;
  feedback.innerHTML = `
    <i class="fas ${sucesso ? 'fa-check-circle' : 'fa-times-circle'}"></i>
    <span>${mensagem}</span>
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.classList.add('fadeOutUp');
    setTimeout(() => feedback.remove(), 500);
  }, 2000);
}

// Inicializa tudo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarTrilhas);

let vidas = 3;
let tempoRecarga = null;
let intervaloRecarga = null;

// Função para atualizar a exibição das vidas
function atualizarVidas() {
  const elementoVidas = document.getElementById('vidas');
  if (elementoVidas) {
    elementoVidas.textContent = vidas;
  }
}

// Função para aplicar dano (perder vida)
function aplicarDano() {
  if (vidas <= 0 || document.body.classList.contains('recarga-vidas')) return;

  vidas--;
  atualizarVidas();

  // Aplica efeitos visuais
  document.body.classList.add('dano-effect');
  setTimeout(() => {
    document.body.classList.remove('dano-effect');
  }, 500);

  // Verifica se as vidas chegaram a zero
  if (vidas <= 0) {
    iniciarRecargaVidas();
  }
}

// Função para iniciar recarga de vidas
function iniciarRecargaVidas() {
  const tempoTotalRecarga = 60; // 1 minuto em segundos
  let tempoRestante = tempoTotalRecarga;

  // Aplica classe de recarga
  document.body.classList.add('recarga-vidas');
  
  // Cria elemento de contagem regressiva
  const tempoElement = document.createElement('div');
  tempoElement.className = 'tempo-recarga';
  tempoElement.textContent = formatarTempo(tempoRestante);
  document.body.appendChild(tempoElement);

  // Atualiza o timer a cada segundo
  intervaloRecarga = setInterval(() => {
    tempoRestante--;
    tempoElement.textContent = formatarTempo(tempoRestante);

    if (tempoRestante <= 0) {
      clearInterval(intervaloRecarga);
      vidas = 3;
      atualizarVidas();
      document.body.classList.remove('recarga-vidas');
      tempoElement.remove();
    }
  }, 1000);
}

// Função auxiliar para formatar tempo (MM:SS)
function formatarTempo(segundos) {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Modifique a função verificarRespostaMultiplaEscolha
function verificarRespostaMultiplaEscolha(correta) {
  const opcaoSelecionada = event.currentTarget;
  
  if (correta) {
    opcaoSelecionada.classList.add('correta');
    mostrarFeedback('Resposta correta!', true);
    streak++; // Incrementa o streak
    atualizarStreak();
    setTimeout(() => {
      perguntaAtual++;
      exibirPerguntaAtual();
    }, 1500);
  } else {
    opcaoSelecionada.classList.add('incorreta');
    mostrarFeedback('Resposta incorreta! Tente novamente.', false);
    streak = 0; // Zera o streak
    atualizarStreak();
    aplicarDano();
  }
}

function verificarRespostaLacuna() {
  const lacunas = document.querySelectorAll('.lacuna');
  let todasCorretas = true;

  lacunas.forEach(lacuna => {
    const respostaUsuario = lacuna.dataset.preenchido;
    const respostaCorreta = lacuna.dataset.resposta;

    if (respostaUsuario && respostaUsuario.toLowerCase() === respostaCorreta.toLowerCase()) {
      lacuna.classList.add('correta');
      lacuna.classList.remove('incorreta');
    } else {
      lacuna.classList.add('incorreta');
      lacuna.classList.remove('correta');
      todasCorretas = false;
    }
  });

  if (todasCorretas) {
    mostrarFeedback('Resposta correta!', true);
    streak++; // Incrementa o streak
    atualizarStreak();
    setTimeout(() => {
      perguntaAtual++;
      exibirPerguntaAtual();
    }, 1500);
  } else {
    mostrarFeedback('Algumas respostas estão incorretas!', false);
    streak = 0; // Zera o streak
    atualizarStreak();
    aplicarDano();
  }
}

// Modifique a função verificarRespostaLacuna
function verificarRespostaLacuna() {
  const lacunas = document.querySelectorAll('.lacuna');
  let todasCorretas = true;

  lacunas.forEach(lacuna => {
    const respostaUsuario = lacuna.dataset.preenchido;
    const respostaCorreta = lacuna.dataset.resposta;

    if (respostaUsuario && respostaUsuario.toLowerCase() === respostaCorreta.toLowerCase()) {
      lacuna.classList.add('correta');
      lacuna.classList.remove('incorreta');
    } else {
      lacuna.classList.add('incorreta');
      lacuna.classList.remove('correta');
      todasCorretas = false;
    }
  });

  if (todasCorretas) {
    mostrarFeedback('Resposta correta!', true);
    setTimeout(() => {
      perguntaAtual++;
      exibirPerguntaAtual();
    }, 1500);
  } else {
    mostrarFeedback('Algumas respostas estão incorretas!', false);
    aplicarDano(); // Adiciona esta linha para aplicar dano ao errar
  }
}

// Adicione esta linha no final da função carregarTrilhas para inicializar as vidas
atualizarVidas();


let streak = 0; // Variável para contar a sequência de acertos

function atualizarStreak() {
  const elementoStreak = document.getElementById('streak');
  if (elementoStreak) {
    elementoStreak.textContent = streak;
    
    // Adiciona classes baseadas no valor do streak para efeitos visuais
    elementoStreak.className = '';
    if (streak >= 3) {
      elementoStreak.classList.add('streak-high');
    } else if (streak >= 1) {
      elementoStreak.classList.add('streak-medium');
    }
  }
}

