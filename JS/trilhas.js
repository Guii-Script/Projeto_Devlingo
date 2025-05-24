// trilhas.js
const trilhas = {};

// Função para carregar trilhas do banco de dados
async function carregarTrilhas() {
  try {
    const response = await fetch('conexao.php');
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do servidor');
    }
    const trilhasDoBanco = await response.json();
    
    // Organiza as trilhas por nome para fácil acesso
    trilhasDoBanco.forEach(trilha => {
      trilhas[trilha.nome] = trilha;
    });
    
    renderizarTrilhas();
  } catch (error) {
    console.error('Erro ao carregar trilhas:', error);
    document.getElementById('conteudoTrilha').innerHTML = `
      <div class="error">
        <p>Erro ao carregar trilhas. Por favor, recarregue a página.</p>
      </div>
    `;
  }
}

// Função para renderizar as trilhas no menu lateral
function renderizarTrilhas() {
  const trilhasMenu = document.querySelector('.trilhas-menu');
  if (!trilhasMenu) return;
  
  trilhasMenu.innerHTML = '';
  
  Object.values(trilhas).forEach(trilha => {
    const icone = getIconeTrilha(trilha.nome);
    const botao = document.createElement('button');
    botao.className = 'botao-trilha';
    botao.innerHTML = `<i class="${icone}"></i> ${trilha.nome}`;
    botao.onclick = () => abrirTrilha(trilha.nome);
    trilhasMenu.appendChild(botao);
  });
}

// Função auxiliar para obter o ícone correto para cada trilha
function getIconeTrilha(nomeTrilha) {
  switch(nomeTrilha) {
    case 'C#': return 'fab fa-microsoft';
    case 'HTML': return 'fab fa-html5';
    case 'PHP': return 'fab fa-php';
    case 'JavaScript': return 'fab fa-js';
    case 'Database': return 'fas fa-database';
    default: return 'fas fa-code';
  }
}

// Função para abrir uma trilha e exibir suas etapas
function abrirTrilha(trilhaNome) {
  const trilha = trilhas[trilhaNome];
  if (!trilha) return;
  
  const conteudoTrilha = document.getElementById('conteudoTrilha');
  conteudoTrilha.innerHTML = `
    <div class="trilha-inicio">
      <h2 class="titulo-trilha">${trilha.nome}</h2>
      <p class="descricao-trilha">${trilha.descricao || 'Comece sua jornada de aprendizado'}</p>
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
  
  document.getElementById('comecarTrilha').onclick = () => iniciarEtapaAtual(trilhaNome);
}

// Função para calcular o total de perguntas em uma trilha
function calcularTotalPerguntas(trilha) {
  return trilha.etapas.reduce((total, etapa) => total + etapa.perguntas.length, 0);
}

// Função para iniciar a primeira etapa de uma trilha
function iniciarEtapaAtual(trilhaNome) {
  const trilha = trilhas[trilhaNome];
  if (!trilha || !trilha.etapas.length) return;
  
  abrirEtapa(trilhaNome, 0); // Começa pela primeira etapa
}

// Função para abrir uma etapa específica de uma trilha
function abrirEtapa(trilhaNome, etapaIndex) {
  const trilha = trilhas[trilhaNome];
  if (!trilha || !trilha.etapas[etapaIndex]) return;
  
  const etapa = trilha.etapas[etapaIndex];
  const conteudoTrilha = document.getElementById('conteudoTrilha');
  
  conteudoTrilha.innerHTML = `
    <div class="cabecalho-etapa">
      <h2 class="titulo-etapa">${etapa.nome}</h2>
      <div class="progresso-etapa">
        Pergunta 1 de ${etapa.perguntas.length}
      </div>
    </div>
    <div id="etapasContainer" class="etapas-container"></div>
  `;
  
  exibirPerguntaAtual(trilhaNome, etapaIndex, 0);
}

// Função para exibir a pergunta atual de uma etapa
function exibirPerguntaAtual(trilhaNome, etapaIndex, perguntaIndex) {
  const etapa = trilhas[trilhaNome].etapas[etapaIndex];
  const pergunta = etapa.perguntas[perguntaIndex];
  
  if (!pergunta) return;
  
  const etapasContainer = document.getElementById('etapasContainer');
  
  // Atualiza o contador de progresso
  const progressoEtapa = document.querySelector('.progresso-etapa');
  if (progressoEtapa) {
    progressoEtapa.textContent = `Pergunta ${perguntaIndex + 1} de ${etapa.perguntas.length}`;
  }
  
  if (pergunta.tipo === 'multipla-escolha') {
    criarPerguntaMultiplaEscolha(pergunta);
  } else if (pergunta.tipo === 'arrastar-palavras') {
    criarPerguntaArrastar(pergunta);
  }
}

// Função para criar uma pergunta de múltipla escolha
function criarPerguntaMultiplaEscolha(pergunta) {
  const etapasContainer = document.getElementById('etapasContainer');
  etapasContainer.innerHTML = `
    <div class="pergunta-multipla-escolha">
      <p class="texto-pergunta">${pergunta.pergunta}</p>
      <div class="opcoes-resposta"></div>
    </div>
  `;
  
  const opcoesContainer = etapasContainer.querySelector('.opcoes-resposta');
  
  pergunta.opcoes.forEach(opcao => {
    const botao = document.createElement('button');
    botao.className = 'opcao';
    botao.textContent = opcao;
    botao.onclick = () => verificarRespostaMultiplaEscolha(opcao === pergunta.resposta_correta);
    opcoesContainer.appendChild(botao);
  });
}

// Função para criar uma pergunta de arrastar palavras
function criarPerguntaArrastar(pergunta) {
  const etapasContainer = document.getElementById('etapasContainer');
  etapasContainer.innerHTML = '';
  
  const fraseElement = document.createElement('div');
  fraseElement.className = 'frase-com-lacunas';
  
  // Divide a frase em palavras e cria as lacunas
  pergunta.frase.split(' ').forEach(palavra => {
    const palavraLimpa = palavra.replace(/[.,;?!]/g, '');
    
    if (pergunta.lacunas.includes(palavraLimpa)) {
      const lacuna = document.createElement('span');
      lacuna.className = 'lacuna';
      lacuna.dataset.resposta = palavraLimpa;
      lacuna.textContent = '__________';
      lacuna.addEventListener('dragover', permitirSoltar);
      lacuna.addEventListener('drop', soltarPalavra);
      fraseElement.appendChild(lacuna);
      fraseElement.appendChild(document.createTextNode(' '));
    } else {
      fraseElement.appendChild(document.createTextNode(palavra + ' '));
    }
  });
  
  const areaArrastavel = document.createElement('div');
  areaArrastavel.className = 'dragzone';
  
  // Embaralha as opções e cria os itens arrastáveis
  [...pergunta.opcoes].sort(() => Math.random() - 0.5).forEach(palavra => {
    const item = document.createElement('div');
    item.className = 'drag-item';
    item.textContent = palavra;
    item.draggable = true;
    item.addEventListener('dragstart', arrastarPalavra);
    areaArrastavel.appendChild(item);
  });
  
  etapasContainer.appendChild(fraseElement);
  etapasContainer.appendChild(areaArrastavel);
}

// Funções auxiliares para arrastar e soltar
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
  
  if (lacuna.classList.contains('lacuna')) {
    lacuna.textContent = palavra;
    lacuna.dataset.preenchido = palavra;
    lacuna.classList.add('preenchida');
    verificarRespostasArrastar();
  }
}

// Função para verificar respostas do tipo arrastar
function verificarRespostasArrastar() {
  const lacunas = document.querySelectorAll('.lacuna');
  const todasPreenchidas = Array.from(lacunas).every(lacuna => 
    lacuna.textContent !== '__________'
  );
  
  if (todasPreenchidas) {
    const todasCorretas = Array.from(lacunas).every(lacuna =>
      lacuna.dataset.preenchido === lacuna.dataset.resposta
    );
    
    if (todasCorretas) {
      mostrarFeedback('Resposta correta!', true);
      // Aqui você pode avançar para a próxima pergunta
    } else {
      mostrarFeedback('Algumas palavras estão incorretas!', false);
      // Aqui você pode dar feedback de erro
    }
  }
}

// Função para verificar resposta de múltipla escolha
function verificarRespostaMultiplaEscolha(correta) {
  if (correta) {
    mostrarFeedback('Resposta correta!', true);
    // Aqui você pode avançar para a próxima pergunta
  } else {
    mostrarFeedback('Resposta incorreta! Tente novamente.', false);
    // Aqui você pode dar feedback de erro
  }
}

// Função para mostrar feedback ao usuário
function mostrarFeedback(mensagem, acertou) {
  const feedbackContainer = document.createElement('div');
  feedbackContainer.className = `feedback ${acertou ? 'correto' : 'incorreto'}`;
  feedbackContainer.innerHTML = `
    <i class="fas ${acertou ? 'fa-check-circle' : 'fa-times-circle'}"></i>
    <p>${mensagem}</p>
  `;
  
  document.body.appendChild(feedbackContainer);
  
  setTimeout(() => {
    feedbackContainer.remove();
  }, 2000);
}

// Inicializa o aplicativo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarTrilhas);