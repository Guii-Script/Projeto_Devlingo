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
    trilhaDiv.className = 'trilha-item';
    trilhaDiv.innerHTML = `
      <h3>${trilha.nome}</h3>
      <p>${trilha.descricao}</p>
      <button class="botao-trilha" data-trilha="${trilha.nome}">Abrir Trilha</button>
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
    <h2>${trilhaAtual.nome}</h2>
    <p>${trilhaAtual.descricao}</p>
    <div class="etapas-container">
      ${trilhaAtual.etapas.map((etapa, index) => `
        <div class="etapa-card">
          <h3>${etapa.nome}</h3>
          <p>${etapa.descricao}</p>
          <button class="botao-etapa" data-etapa="${index}">Iniciar Etapa</button>
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
    <div class="cabecalho-pergunta">
      <h2>${etapaAtual.nome}</h2>
      <span class="contador">Pergunta ${perguntaAtual + 1} de ${etapaAtual.perguntas.length}</span>
    </div>
    <div class="pergunta-container" id="perguntaContainer"></div>
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
          ${i < partes.length - 1 ? `<span class="lacuna" data-resposta="${pergunta.resposta_correta}">______</span>` : ''}
        `).join('')}
      </div>
      <div class="palavras-disponiveis">
        ${opcoes.map(palavra => `
          <div class="palavra" draggable="true">${palavra}</div>
        `).join('')}
      </div>
      <button class="botao-verificar">Verificar Resposta</button>
    `;

    // Configura drag and drop
    configurarArrastarPalavras();

    // Botão de verificação
    container.querySelector('.botao-verificar').addEventListener('click', verificarRespostaLacuna);

  } 
  // Sistema de Múltipla Escolha
  else if (pergunta.tipo === 'multipla-escolha') {
    container.innerHTML = `
      <p class="enunciado">${pergunta.enunciado}</p>
      <div class="opcoes-resposta">
        ${opcoes.map(opcao => `
          <button class="opcao" data-opcao="${opcao}">${opcao}</button>
        `).join('')}
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
      arrastandoPalavra = palavra.textContent;
      e.dataTransfer.setData('text/plain', palavra.textContent);
      setTimeout(() => palavra.classList.add('invisivel'), 0);
    });

    palavra.addEventListener('dragend', () => {
      palavra.classList.remove('invisivel');
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
      lacuna.textContent = arrastandoPalavra;
      lacuna.dataset.preenchido = arrastandoPalavra;
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
  if (correta) {
    mostrarFeedback('Resposta correta!', true);
    setTimeout(() => {
      perguntaAtual++;
      exibirPerguntaAtual();
    }, 1500);
  } else {
    mostrarFeedback('Resposta incorreta! Tente novamente.', false);
  }
}

// Exibe o resultado final da etapa
function exibirResultadoFinal() {
  const conteudoTrilha = document.getElementById('conteudoTrilha');
  conteudoTrilha.innerHTML = `
    <div class="resultado-final">
      <h2>🎉 Parabéns!</h2>
      <p>Você completou a etapa "${etapaAtual.nome}"</p>
      <button class="botao-voltar" onclick="abrirTrilha('${trilhaAtual.nome}')">
        Voltar para a Trilha
      </button>
    </div>
  `;
}

// Mostra feedback visual
function mostrarFeedback(mensagem, sucesso) {
  const feedback = document.createElement('div');
  feedback.className = `feedback ${sucesso ? 'sucesso' : 'erro'}`;
  feedback.innerHTML = `
    <i class="fas ${sucesso ? 'fa-check-circle' : 'fa-times-circle'}"></i>
    <span>${mensagem}</span>
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.remove();
  }, 2000);
}

// Inicializa tudo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarTrilhas);