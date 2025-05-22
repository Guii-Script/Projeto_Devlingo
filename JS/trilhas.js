const trilhas = {
  'C#': {
    nome: 'Trilha C#',
    etapas: [
      {
        nome: 'Introdução ao C#',
        perguntas: [
          {
            tipo: 'arrastar-palavras',
            frase: 'O método Main é o ponto de entrada de um programa em C#.',
            lacunas: ['erro', 'parada', 'final', 'entrada'],
            opcoes: ['erro', 'parada', 'final', 'entrada']
          },
          {
            tipo: 'multipla-escolha',
            pergunta: 'Qual a palavra-chave usada para declarar uma classe em C#?',
            opcoes: ['class', 'struct', 'interface', 'enum'],
            resposta: 'class'
          },
          {
            tipo: 'arrastar-palavras',
            frase: 'O C# foi criado pela Microsoft',
            lacunas: ['Microsoft', 'Google', 'Oracle', 'Amazon', 'Apple', 'tipada'],
            opcoes: ['Microsoft', 'Google', 'Oracle', 'Amazon', 'Apple', 'tipada']
          },
          {
            tipo: 'multipla-escolha',
            pergunta: 'Qual dos seguintes tipos de dados não existe em C#?',
            opcoes: ['int', 'float', 'double', 'currency'],
            resposta: 'currency'
          },
          {
            tipo: 'arrastar-palavras',
            frase: 'Uma variável serve para guardar temporariamente valores na memória.',
            lacunas: ['variável', 'classe', 'objeto', 'propriedade'],
            opcoes: ['variável', 'classe', 'objeto', 'propriedade']
          }
        ]
      },
      {
        nome: 'Sintaxe Básica',
        perguntas: [
          {
            tipo: 'arrastar-palavras',
            frase: 'int idade = 25;',
            lacunas: ['var', 'int', 'string', 'float', 'boolean'],
            opcoes: ['var', 'int', 'string', 'float', 'boolean']
          },
          {
            tipo: 'multipla-escolha',
            pergunta: 'Qual operador é usado para comparar igualdade em C#?',
            opcoes: ['==', '=', '!=', '<>'],
            resposta: '=='
          },
          {
            tipo: 'arrastar-palavras',
            frase: 'O método Console.WriteLine imprime na tela.',
            lacunas: ['Console.WriteLine', 'Console.ReadLine', 'Main', 'Write', 'System'],
            opcoes: ['Console.WriteLine', 'Console.ReadLine', 'Main', 'Write', 'System']
          },
          {
            tipo: 'multipla-escolha',
            pergunta: 'Qual das opções a seguir é uma estrutura de controle de repetição em C#?',
            opcoes: ['for', 'while', 'foreach', 'all'],
            resposta: 'for'
          },
          {
            tipo: 'arrastar-palavras',
            frase: 'Os arrays em C# têm tamanho fixo',
            lacunas: ['fixo', 'dinâmico', 'imutável', 'ilimitado', 'nulo'],
            opcoes: ['fixo', 'dinâmico', 'imutável', 'ilimitado', 'nulo']
          }
        ]
      }
    ]
  },
  'HTML': {
    nome: 'Trilha HTML',
    etapas: [
      {
        nome: 'Introdução ao HTML',
        perguntas: [
          {
            tipo: 'arrastar-palavras',
            frase: 'HTML significa __________ Markup Language.',
            lacunas: ['HyperText']
          },
          {
            tipo: 'multipla-escolha',
            pergunta: 'Qual tag define o início de um documento HTML?',
            opcoes: ['<html>', '<head>', '<body>', '<!DOCTYPE>'],
            resposta: '<!DOCTYPE>'
          }
        ]
      }
    ]
  }
};

// Estado da aplicação
const estadoApp = {
  trilhaAtual: null,
  etapaAtual: 0,
  perguntaAtual: 0,
  perguntasRespondidas: 0,
  perguntasTotais: 0,
  etapasTotais: 0,
  vidas: 3,
  streak: 0,
  moedas: 0,
  respostasCorretas: 0,
  bloqueado: false,
  tempoRecargaVidas: null,
  respondendo: false,
  // Novos estados para missões
  liçõesConcluidasHoje: 0,
  trilhasConcluidasSemana: 0,
  ultimoDiaJogado: null
};

// Elementos DOM
const elementosDOM = {
  conteudoTrilha: document.getElementById('conteudoTrilha'),
  barraDiaria: document.getElementById('barraDiaria'),
  barraSemanal: document.getElementById('barraSemanal'),
  vidasElement: document.getElementById('vidas'),
  streakElement: document.getElementById('streak'),
  moedasElement: document.getElementById('moedas'),
  timerVidasElement: document.getElementById('timerVidas'),
  feedbackContainer: document.createElement('div'),
  overlayDano: document.createElement('div'),
  body: document.body
};

// Inicialização do jogo
function inicializar() {
  verificarResetDiario();
  configurarElementosDOM();
  atualizarStatus();
  atualizarBarrasProgresso();
}

function verificarResetDiario() {
  const hoje = new Date().toDateString();
  
  // Se for um novo dia, resetar contadores diários
  if (estadoApp.ultimoDiaJogado !== hoje) {
    estadoApp.liçõesConcluidasHoje = 0;
    estadoApp.ultimoDiaJogado = hoje;
  }
  
  // Aqui você pode adicionar lógica para verificar se é uma nova semana
  // e resetar o contador semanal se necessário
}

function configurarElementosDOM() {
  elementosDOM.feedbackContainer.className = 'feedback-container';
  document.body.appendChild(elementosDOM.feedbackContainer);

  elementosDOM.overlayDano.className = 'overlay-dano';
  document.body.appendChild(elementosDOM.overlayDano);
}

// Atualiza a exibição dos status
function atualizarStatus() {
  elementosDOM.vidasElement.textContent = estadoApp.vidas;
  elementosDOM.streakElement.textContent = estadoApp.streak;
  elementosDOM.moedasElement.textContent = estadoApp.moedas;
  
  if (estadoApp.bloqueado && estadoApp.tempoRecargaVidas) {
    elementosDOM.timerVidasElement.style.display = 'inline';
    iniciarContadorVidas();
  } else {
    elementosDOM.timerVidasElement.style.display = 'none';
  }
}

function atualizarBarrasProgresso() {
  // Barra diária (1 lição = 100%)
  const progressoDiario = Math.min(estadoApp.liçõesConcluidasHoje, 1);
  elementosDOM.barraDiaria.style.width = `${progressoDiario * 100}%`;
  elementosDOM.barraDiaria.textContent = `${estadoApp.liçõesConcluidasHoje}/1`;
  
  // Barra semanal (1 trilha = 100%)
  const progressoSemanal = Math.min(estadoApp.trilhasConcluidasSemana, 1);
  elementosDOM.barraSemanal.style.width = `${progressoSemanal * 100}%`;
  elementosDOM.barraSemanal.textContent = `${estadoApp.trilhasConcluidasSemana}/1`;
}

// Efeito visual ao perder vida
function efeitoPerdaVida() {
  elementosDOM.overlayDano.classList.add('ativo');
  
  setTimeout(() => {
    elementosDOM.overlayDano.classList.remove('ativo');
  }, 500);
}

// Controle de resposta para evitar múltiplos cliques
function podeResponder() {
  if (estadoApp.respondendo || estadoApp.bloqueado) return false;
  estadoApp.respondendo = true;
  return true;
}

function liberarResposta() {
  estadoApp.respondendo = false;
}

// Gerenciamento de vidas
function perderVida() {
  if (estadoApp.vidas <= 0) return;
  
  estadoApp.vidas--;
  estadoApp.streak = 0;
  efeitoPerdaVida();
  atualizarStatus();
  
  if (estadoApp.vidas <= 0) {
    estadoApp.bloqueado = true;
    estadoApp.tempoRecargaVidas = new Date(Date.now() + 5 * 60 * 1000);
    mostrarFeedback('Você perdeu todas as vidas! Espere 5 minutos.', false);
  }
}

// Inicia o contador para recarregar vidas
function iniciarContadorVidas() {
  const agora = new Date();
  const diferenca = estadoApp.tempoRecargaVidas - agora;
  
  if (diferenca <= 0) {
    recarregarVidas();
    return;
  }
  
  const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
  
  elementosDOM.timerVidasElement.textContent = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  
  setTimeout(iniciarContadorVidas, 1000);
}

function recarregarVidas() {
  estadoApp.vidas = 3;
  estadoApp.bloqueado = false;
  estadoApp.tempoRecargaVidas = null;
  atualizarStatus();
  mostrarFeedback('Suas vidas foram recarregadas!', true);
}

// Funções principais do jogo
function abrirTrilha(trilha) {
  if (estadoApp.bloqueado) {
    mostrarFeedback('Você está sem vidas! Espere elas recarregarem.', false);
    return;
  }

  if (!trilhas[trilha]) {
    console.error('Trilha não encontrada:', trilha);
    return;
  }

  estadoApp.trilhaAtual = trilha;
  estadoApp.etapaAtual = 0;
  estadoApp.perguntaAtual = 0;
  estadoApp.perguntasRespondidas = 0;
  estadoApp.respostasCorretas = 0;

  const trilhaSelecionada = trilhas[trilha];
  estadoApp.perguntasTotais = calcularTotalPerguntas(trilhaSelecionada);
  estadoApp.etapasTotais = trilhaSelecionada.etapas.length;

  renderizarTelaInicialTrilha(trilhaSelecionada);
}

function calcularTotalPerguntas(trilha) {
  return trilha.etapas.reduce((total, etapa) => total + etapa.perguntas.length, 0);
}

function renderizarTelaInicialTrilha(trilha) {
  elementosDOM.conteudoTrilha.innerHTML = `
    <div class="trilha-inicio">
      <h2 class="titulo-trilha">${trilha.nome}</h2>
      <p class="descricao-trilha">Comece sua jornada de aprendizado em ${trilha.nome}</p>
      <div class="estatisticas-trilha">
        <div class="estatistica">
          <span class="numero">${trilha.etapas.length}</span>
          <span class="rotulo">Etapas</span>
        </div>
        <div class="estatistica">
          <span class="numero">${calcularTotalPerguntas(trilha)}</span>
          <span class="rotulo">Perguntas</span>
        </div>
      </div>
      <button id="comecarTrilha" class="botao-primario">Começar Trilha</button>
    </div>
  `;

  document.getElementById('comecarTrilha').addEventListener('click', iniciarEtapaAtual);
}

function iniciarEtapaAtual() {
  const trilha = trilhas[estadoApp.trilhaAtual];
  const etapa = trilha.etapas[estadoApp.etapaAtual];

  elementosDOM.conteudoTrilha.innerHTML = `
    <div class="cabecalho-etapa">
      <h2 class="titulo-etapa">${etapa.nome}</h2>
      <div class="progresso-etapa">
        Pergunta ${estadoApp.perguntaAtual + 1} de ${etapa.perguntas.length}
      </div>
    </div>
    <div id="etapasContainer" class="etapas-container"></div>
  `;

  elementosDOM.etapasContainer = document.getElementById('etapasContainer');
  exibirPerguntaAtual();
}

function exibirPerguntaAtual() {
  const trilha = trilhas[estadoApp.trilhaAtual];
  const etapa = trilha.etapas[estadoApp.etapaAtual];
  const pergunta = etapa.perguntas[estadoApp.perguntaAtual];

  if (pergunta.tipo === 'arrastar-palavras') {
    criarPerguntaArrastar(pergunta);
  } else if (pergunta.tipo === 'multipla-escolha') {
    criarPerguntaMultiplaEscolha(pergunta);
  }
}

function criarPerguntaArrastar(pergunta) {
  const { frase, lacunas } = pergunta;
  const palavras = frase.split(' ');
  const container = elementosDOM.etapasContainer;
  
  container.innerHTML = '';
  
  const contador = document.querySelector('.progresso-etapa');
  if (contador) {
    const trilha = trilhas[estadoApp.trilhaAtual];
    const etapa = trilha.etapas[estadoApp.etapaAtual];
    contador.textContent = `Pergunta ${estadoApp.perguntaAtual + 1} de ${etapa.perguntas.length}`;
  }

  const fraseElement = document.createElement('div');
  fraseElement.className = 'frase-com-lacunas';
  
  palavras.forEach((palavra) => {
    const palavraLimpa = palavra.replace(/[,;?!]/g, '');
    
    if (lacunas.includes(palavraLimpa)) {
      const lacuna = document.createElement('span');
      lacuna.className = 'lacuna';
      lacuna.dataset.resposta = palavraLimpa;
      lacuna.textContent = '__________';
      lacuna.addEventListener('dragover', permitirSoltar);
      lacuna.addEventListener('drop', soltarPalavra);
      fraseElement.appendChild(lacuna);
      
      if (!/[,;?!]/.test(palavra)) {
        fraseElement.appendChild(document.createTextNode(' '));
      }
    } else {
      fraseElement.appendChild(document.createTextNode(palavra + ' '));
    }
  });
  
  const areaArrastavel = document.createElement('div');
  areaArrastavel.className = 'dragzone';
  
  const lacunasEmbaralhadas = [...lacunas].sort(() => Math.random() - 0.5);
  
  lacunasEmbaralhadas.forEach(palavra => {
    const item = document.createElement('div');
    item.className = 'drag-item';
    item.textContent = palavra;
    item.draggable = true;
    item.addEventListener('dragstart', arrastarPalavra);
    areaArrastavel.appendChild(item);
  });
  
  container.appendChild(fraseElement);
  container.appendChild(areaArrastavel);
}

function permitirSoltar(e) {
  e.preventDefault();
}

function arrastarPalavra(e) {
  e.dataTransfer.setData('text/plain', e.target.textContent);
}

function soltarPalavra(e) {
  e.preventDefault();
  const palavra = e.dataTransfer.getData('text/plain');
  const lacuna = e.target;
  
  if (lacuna.classList.contains('lacuna') && lacuna.textContent === '__________') {
    lacuna.textContent = palavra;
    lacuna.dataset.preenchido = palavra;
    lacuna.classList.add('preenchida');
    
    verificarRespostasArrastar();
  }
}

function verificarRespostasArrastar() {
  if (!podeResponder()) return;

  const lacunas = elementosDOM.etapasContainer.querySelectorAll('.lacuna');
  const todasPreenchidas = Array.from(lacunas).every(lacuna => 
    lacuna.textContent !== '__________'
  );
  
  if (todasPreenchidas) {
    const todasCorretas = Array.from(lacunas).every(lacuna =>
      lacuna.dataset.preenchido === lacuna.dataset.resposta
    );
    
    if (todasCorretas) {
      mostrarFeedback('Resposta correta!', true);
      avancarPergunta(true);
    } else {
      perderVida();
      mostrarFeedback('Algumas palavras estão incorretas!', false);
      
      setTimeout(() => {
        lacunas.forEach(lacuna => {
          lacuna.textContent = '__________';
          lacuna.classList.remove('preenchida');
          delete lacuna.dataset.preenchido;
        });
        liberarResposta();
      }, 1500);
    }
  }
}

function criarPerguntaMultiplaEscolha(pergunta) {
  const { pergunta: texto, opcoes, resposta } = pergunta;
  const container = elementosDOM.etapasContainer;
  
  container.innerHTML = `
    <div class="pergunta-multipla-escolha">
      <p class="texto-pergunta">${texto}</p>
      <div class="opcoes-resposta"></div>
    </div>
  `;
  
  const contador = document.querySelector('.progresso-etapa');
  if (contador) {
    const trilha = trilhas[estadoApp.trilhaAtual];
    const etapa = trilha.etapas[estadoApp.etapaAtual];
    contador.textContent = `Pergunta ${estadoApp.perguntaAtual + 1} de ${etapa.perguntas.length}`;
  }

  const opcoesContainer = container.querySelector('.opcoes-resposta');
  
  opcoes.forEach(opcao => {
    const botao = document.createElement('button');
    botao.className = 'opcao';
    botao.textContent = opcao;
    botao.addEventListener('click', () => {
      verificarRespostaMultiplaEscolha(opcao === resposta, resposta);
    });
    opcoesContainer.appendChild(botao);
  });
}

function verificarRespostaMultiplaEscolha(correta, respostaCorreta) {
  if (!podeResponder()) return;

  if (correta) {
    mostrarFeedback('Resposta correta!', true);
    avancarPergunta(true);
  } else {
    perderVida();
    mostrarFeedback(`Resposta incorreta! A resposta correta é: ${respostaCorreta}`, false);
    liberarResposta();
  }
}

function mostrarFeedback(mensagem, acertou) {
  elementosDOM.feedbackContainer.innerHTML = `
    <div class="feedback ${acertou ? 'correto' : 'incorreto'}">
      <i class="fas ${acertou ? 'fa-check-circle' : 'fa-times-circle'}"></i>
      <p>${mensagem}</p>
    </div>
  `;
  
  elementosDOM.feedbackContainer.style.display = 'block';
  
  setTimeout(() => {
    elementosDOM.feedbackContainer.style.display = 'none';
  }, 1500);
}

function avancarPergunta(acertou) {
  if (acertou) {
    estadoApp.respostasCorretas++;
    estadoApp.streak++;
    estadoApp.moedas += 10;
    estadoApp.perguntasRespondidas++;
    atualizarStatus();
  }
  
  const trilha = trilhas[estadoApp.trilhaAtual];
  const etapa = trilha.etapas[estadoApp.etapaAtual];
  
  estadoApp.perguntaAtual++;
  
  if (estadoApp.perguntaAtual >= etapa.perguntas.length) {
    // Lição concluída!
    estadoApp.liçõesConcluidasHoje = 1; // Máximo 1 por dia
    estadoApp.etapaAtual++;
    estadoApp.perguntaAtual = 0;
    
    if (estadoApp.etapaAtual >= trilha.etapas.length) {
      // Trilha concluída!
      estadoApp.trilhasConcluidasSemana = 1; // Máximo 1 por semana
      mostrarConclusaoTrilha();
    } else {
      iniciarEtapaAtual();
    }
    
    atualizarBarrasProgresso();
  } else {
    exibirPerguntaAtual();
  }
  
  liberarResposta();
}

function mostrarConclusaoTrilha() {
  elementosDOM.conteudoTrilha.innerHTML = `
    <div class="trilha-concluida">
      <h2 class="titulo-conclusao">Trilha Concluída!</h2>
      <p class="mensagem-conclusao">Parabéns! Você completou a trilha ${trilhas[estadoApp.trilhaAtual].nome}.</p>
      <div class="estatisticas-conclusao">
        <div class="estatistica">
          <span class="numero">${estadoApp.etapasTotais}</span>
          <span class="rotulo">Etapas</span>
        </div>
        <div class="estatistica">
          <span class="numero">${estadoApp.perguntasTotais}</span>
          <span class="rotulo">Perguntas</span>
        </div>
        <div class="estatistica">
          <span class="numero">${estadoApp.respostasCorretas}</span>
          <span class="rotulo">Acertos</span>
        </div>
        <div class="estatistica">
          <span class="numero">${estadoApp.moedas}</span>
          <span class="rotulo">Moedas</span>
        </div>
      </div>
      <button class="botao-primario" onclick="abrirTrilha('${estadoApp.trilhaAtual}')">
        <i class="fas fa-redo"></i> Refazer Trilha
      </button>
    </div>
  `;
}

// Inicializa o aplicativo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializar);