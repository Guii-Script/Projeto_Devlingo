let trilhaAtual = null;
let etapaAtual = null;
let perguntaAtual = 0;

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
  }
}

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

  document.querySelectorAll('.botao-trilha').forEach(botao => {
    botao.addEventListener('click', (event) => {
      abrirTrilha(event.target.getAttribute('data-trilha'));
    });
  });
}

function abrirTrilha(trilhaNome) {
  trilhaAtual = window.trilhas[trilhaNome];
  if (!trilhaAtual) return;

  const conteudoTrilha = document.getElementById('conteudoTrilha');
  if (!conteudoTrilha) return;

  conteudoTrilha.innerHTML = `
    <h2>${trilhaAtual.nome}</h2>
    <p>${trilhaAtual.descricao}</p>
    <ul>
      ${trilhaAtual.etapas.map((etapa, index) => `
        <li>
          <h4>${etapa.nome}</h4>
          <p>${etapa.descricao}</p>
          <button class="botao-etapa" data-etapa-index="${index}">Iniciar</button>
        </li>
      `).join('')}
    </ul>
  `;

  document.querySelectorAll('.botao-etapa').forEach(botao => {
    botao.addEventListener('click', (event) => {
      abrirEtapa(event.target.getAttribute('data-etapa-index'));
    });
  });
}

function abrirEtapa(etapaIndex) {
  etapaAtual = trilhaAtual.etapas[etapaIndex];
  perguntaAtual = 0;
  if (!etapaAtual) return;
  exibirPerguntaAtual();
}

function exibirPerguntaAtual() {
  const pergunta = etapaAtual.perguntas[perguntaAtual];
  if (!pergunta) {
    exibirResultadoFinal();
    return;
  }

  const conteudoTrilha = document.getElementById('conteudoTrilha');
  if (!conteudoTrilha) return;

  // Verifica se opcoes é uma string JSON ou já um array
  let opcoes = [];
  try {
    opcoes = typeof pergunta.opcoes === 'string' ? 
             JSON.parse(pergunta.opcoes) : 
             pergunta.opcoes || [];
  } catch (e) {
    console.error('Erro ao parsear opções:', e);
    opcoes = [];
  }

  conteudoTrilha.innerHTML = `
    <h2>${etapaAtual.nome}</h2>
    <div class="pergunta-container">
      <p class="enunciado">${pergunta.enunciado}</p>
      ${pergunta.tipo === 'multipla-escolha' ? `
        <ul class="opcoes-resposta">
          ${opcoes.map((opcao, index) => `
            <li>
              <button class="botao-opcao" data-opcao-index="${index}">${opcao}</button>
            </li>
          `).join('')}
        </ul>
      ` : `
        <div class="arrastar-container">
          ${opcoes.map((opcao, index) => `
            <span class="palavra-arrastar" draggable="true">${opcao}</span>
          `).join('')}
        </div>
      `}
    </div>
  `;

  document.querySelectorAll('.botao-opcao').forEach(botao => {
    botao.addEventListener('click', (event) => {
      verificarResposta(event.target.getAttribute('data-opcao-index'));
    });
  });
}

function verificarResposta(opcaoIndex) {
  const pergunta = etapaAtual.perguntas[perguntaAtual];
  if (!pergunta) return;

  let opcoes = [];
  try {
    opcoes = typeof pergunta.opcoes === 'string' ? 
             JSON.parse(pergunta.opcoes) : 
             pergunta.opcoes || [];
  } catch (e) {
    console.error('Erro ao parsear opções:', e);
    opcoes = [];
  }

  const respostaSelecionada = opcoes[opcaoIndex];
  const respostaCorreta = pergunta.resposta_correta;

  const correta = respostaSelecionada && respostaCorreta && 
                 respostaSelecionada.trim().toLowerCase() === respostaCorreta.trim().toLowerCase();

  exibirFeedback(correta);
  
  if (correta) {
    perguntaAtual++;
    setTimeout(exibirPerguntaAtual, 1500);
  }
}

function exibirFeedback(correto) {
  const conteudoTrilha = document.getElementById('conteudoTrilha');
  const feedback = document.createElement('div');
  feedback.className = `feedback ${correto ? 'correto' : 'incorreto'}`;
  feedback.textContent = correto ? '✓ Correto!' : '✗ Incorreto! Tente novamente.';
  conteudoTrilha.appendChild(feedback);

  setTimeout(() => feedback.remove(), 2000);
}

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

document.addEventListener('DOMContentLoaded', carregarTrilhas);