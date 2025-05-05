// Objeto com todas as trilhas disponíveis
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
            frase: 'O C# foi criado pela Microsoft.',
            lacunas: ['Microsoft', 'fortemente', 'Oracle', 'fracamente', 'Apple', 'tipada'],
            opcoes: ['Microsoft', 'fortemente', 'Oracle', 'fracamente', 'Apple', 'tipada']
          },
          {
            tipo: 'multipla-escolha',
            pergunta: 'Qual dos seguintes tipos de dados não existe em C#?',
            opcoes: ['int', 'float', 'double', 'currency'],
            resposta: 'currency'
          },
          {
            tipo: 'arrastar-palavras',
            frase: 'As variáveis em C# são __________ tipadas.',
            lacunas: ['fortemente']
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
            frase: 'O método __________ imprime na tela.',
            lacunas: ['Console.WriteLine']
          },
          {
            tipo: 'multipla-escolha',
            pergunta: 'Qual das opções a seguir é uma estrutura de controle de repetição em C#?',
            opcoes: ['for', 'while', 'foreach', 'all'],
            resposta: 'for'
          },
          {
            tipo: 'arrastar-palavras',
            frase: 'Os arrays em C# têm tamanho __________.',
            lacunas: ['fixo']
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
  etapasTotais: 0
};

// Elementos DOM
const elementosDOM = {
  conteudoTrilha: document.getElementById('conteudoTrilha'),
  barraDiaria: document.getElementById('barraDiaria'),
  barraSemanal: document.getElementById('barraSemanal')
};

// Função para iniciar uma trilha
function abrirTrilha(trilha) {
  if (!trilhas[trilha]) {
    console.error('Trilha não encontrada:', trilha);
    return;
  }

  // Atualiza o estado
  estadoApp.trilhaAtual = trilha;
  estadoApp.etapaAtual = 0;
  estadoApp.perguntaAtual = 0;
  estadoApp.perguntasRespondidas = 0;

  const trilhaSelecionada = trilhas[trilha];
  estadoApp.perguntasTotais = calcularTotalPerguntas(trilhaSelecionada);
  estadoApp.etapasTotais = trilhaSelecionada.etapas.length;

  // Renderiza a tela inicial da trilha
  renderizarTelaInicialTrilha(trilhaSelecionada);
}

// Calcula o total de perguntas em uma trilha
function calcularTotalPerguntas(trilha) {
  return trilha.etapas.reduce((total, etapa) => total + etapa.perguntas.length, 0);
}

// Renderiza a tela inicial da trilha
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

  document.getElementById('comecarTrilha').addEventListener('click', () => {
    iniciarEtapaAtual();
  });
}

// Inicia a etapa atual
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

// Exibe a pergunta atual
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

// Cria uma pergunta do tipo "arrastar palavras" - VERSÃO CORRIGIDA
function criarPerguntaArrastar(pergunta) {
  const { frase, lacunas } = pergunta;
  const palavras = frase.split(' ');
  const container = elementosDOM.etapasContainer;
  
  container.innerHTML = '';
  
  // Atualiza o contador de perguntas
  const contador = document.querySelector('.progresso-etapa');
  if (contador) {
    const trilha = trilhas[estadoApp.trilhaAtual];
    const etapa = trilha.etapas[estadoApp.etapaAtual];
    contador.textContent = `Pergunta ${estadoApp.perguntaAtual + 1} de ${etapa.perguntas.length}`;
  }

  // Cria a frase com lacunas
  const fraseElement = document.createElement('div');
  fraseElement.className = 'frase-com-lacunas';
  
  palavras.forEach((palavra) => {
    // Verifica se a palavra (sem pontuação) está nas lacunas
    const palavraLimpa = palavra.replace(/[.,;?!]/g, '');
    
    if (lacunas.includes(palavraLimpa)) {
      const lacuna = document.createElement('span');
      lacuna.className = 'lacuna';
      lacuna.dataset.resposta = palavraLimpa;
      lacuna.textContent = '__________';
      lacuna.addEventListener('dragover', permitirSoltar);
      lacuna.addEventListener('drop', soltarPalavra);
      fraseElement.appendChild(lacuna);
      
      // Adiciona espaço após a lacuna, exceto se for pontuação
      if (!/[.,;?!]/.test(palavra)) {
        fraseElement.appendChild(document.createTextNode(' '));
      }
    } else {
      fraseElement.appendChild(document.createTextNode(palavra + ' '));
    }
  });
  
  // Cria a área de palavras arrastáveis
  const areaArrastavel = document.createElement('div');
  areaArrastavel.className = 'dragzone';
  
  // Embaralha as palavras para arrastar
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

// Funções para arrastar e soltar palavras
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
  
  // Só permite soltar se for uma lacuna vazia
  if (lacuna.classList.contains('lacuna') && lacuna.textContent === '__________') {
    lacuna.textContent = palavra;
    lacuna.dataset.preenchido = palavra;
    lacuna.classList.add('preenchida');
    
    // Verifica se todas as lacunas foram preenchidas
    verificarRespostasArrastar();
  }
}

// Verifica as respostas do tipo arrastar - VERSÃO CORRIGIDA
function verificarRespostasArrastar() {
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
    } else {
      mostrarFeedback('Algumas palavras estão incorretas. Tente novamente!', false);
      // Resetar lacunas após um tempo
      setTimeout(() => {
        lacunas.forEach(lacuna => {
          lacuna.textContent = '__________';
          lacuna.classList.remove('preenchida');
          delete lacuna.dataset.preenchido;
        });
      }, 1500);
    }
  }
}

// Cria uma pergunta de múltipla escolha
function criarPerguntaMultiplaEscolha(pergunta) {
  const { pergunta: texto, opcoes, resposta } = pergunta;
  const container = elementosDOM.etapasContainer;
  
  container.innerHTML = `
    <div class="pergunta-multipla-escolha">
      <p class="texto-pergunta">${texto}</p>
      <div class="opcoes-resposta"></div>
    </div>
  `;
  
  // Atualiza o contador de perguntas
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

// Verifica a resposta de múltipla escolha
function verificarRespostaMultiplaEscolha(correta, respostaCorreta) {
  if (correta) {
    mostrarFeedback('Resposta correta!', true);
  } else {
    mostrarFeedback(`Resposta incorreta. A resposta correta é: ${respostaCorreta}`, false);
  }
}

// Mostra feedback e avança ou não
function mostrarFeedback(mensagem, acertou) {
  alert(mensagem); // Poderia ser substituído por um modal mais bonito
  
  if (acertou) {
    estadoApp.perguntasRespondidas++;
    atualizarProgresso();
    
    const trilha = trilhas[estadoApp.trilhaAtual];
    const etapa = trilha.etapas[estadoApp.etapaAtual];
    
    // Avança para a próxima pergunta ou etapa
    estadoApp.perguntaAtual++;
    
    if (estadoApp.perguntaAtual >= etapa.perguntas.length) {
      estadoApp.etapaAtual++;
      estadoApp.perguntaAtual = 0;
      
      if (estadoApp.etapaAtual >= trilha.etapas.length) {
        // Trilha concluída
        mostrarConclusaoTrilha();
      } else {
        // Próxima etapa
        iniciarEtapaAtual();
      }
    } else {
      // Próxima pergunta na mesma etapa
      exibirPerguntaAtual();
    }
  }
}

// Atualiza as barras de progresso
function atualizarProgresso() {
  // Atualiza missão diária (1/1)
  elementosDOM.barraDiaria.style.width = '100%';
  elementosDOM.barraDiaria.textContent = '1 / 1';
  
  // Atualiza missão semanal (baseado no progresso da trilha)
  const progresso = Math.round((estadoApp.perguntasRespondidas / estadoApp.perguntasTotais) * 100);
  elementosDOM.barraSemanal.style.width = `${progresso}%`;
  elementosDOM.barraSemanal.textContent = `${estadoApp.perguntasRespondidas} / ${estadoApp.perguntasTotais}`;
}

// Mostra tela de conclusão da trilha
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
          <span class="numero">${estadoApp.perguntasRespondidas}</span>
          <span class="rotulo">Acertos</span>
        </div>
      </div>
      <button class="botao-primario" onclick="abrirTrilha('${estadoApp.trilhaAtual}')">Refazer Trilha</button>
    </div>
  `;
}

// Adiciona os estilos dinamicamente
function adicionarEstilosDinamicos() {
  const style = document.createElement('style');
  style.textContent = `
    .trilha-inicio, .trilha-concluida {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    
    .titulo-trilha, .titulo-conclusao {
      color: #2EF2AA;
      margin-bottom: 1rem;
      font-size: 2rem;
    }
    
    .descricao-trilha, .mensagem-conclusao {
      margin-bottom: 2rem;
      color: #ccc;
    }
    
    .estatisticas-trilha, .estatisticas-conclusao {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .estatistica {
      display: flex;
      flex-direction: column;
    }
    
    .numero {
      font-size: 2rem;
      font-weight: bold;
      color: #2EF2AA;
    }
    
    .rotulo {
      font-size: 0.9rem;
      color: #aaa;
    }
    
    .botao-primario {
      background-color: #2EF2AA;
      color: #0f2b40;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 50px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }
    
    .botao-primario:hover {
      background-color: #25d895;
      transform: translateY(-2px);
    }
    
    .cabecalho-etapa {
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .titulo-etapa {
      color: #2EF2AA;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .progresso-etapa {
      color: #aaa;
      font-size: 0.9rem;
    }
    
    .frase-com-lacunas {
      font-size: 1.2rem;
      line-height: 2;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .lacuna {
      display: inline-block;
      min-width: 100px;
      background-color: #264a64;
      border-radius: 5px;
      padding: 0 10px;
      margin: 0 5px;
      color: transparent;
      text-shadow: 0 0 5px rgba(255,255,255,0.5);
      position: relative;
    }
    
    .lacuna.preenchida {
      color: white;
      text-shadow: none;
      background-color: #1a2a40;
    }
    
    .pergunta-multipla-escolha {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .texto-pergunta {
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .opcoes-resposta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .opcao {
      background-color: #264a64;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }
    
    .opcao:hover {
      background-color: #2EF2AA;
      color: #0f2b40;
    }
    
    .dragzone {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      margin-top: 1rem;
    }
    
    .drag-item {
      background-color: #2EF2AA;
      color: #0f2b40;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: move;
      user-select: none;
    }
  `;
  document.head.appendChild(style);
}

// Inicializa o aplicativo
adicionarEstilosDinamicos();