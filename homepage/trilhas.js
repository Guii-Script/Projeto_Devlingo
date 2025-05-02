const trilhas = {
  'C#': {
    nome: 'Trilha C#',
    etapas: [
      {
        nome: 'Introdução ao C#',
        perguntas: [
          { tipo: 'arrastar-palavras', frase: 'A programação orientada a __________ usa classes e objetos.', lacunas: ['orientada', 'classe', 'objetos'] },
          { tipo: 'multipla-escolha', pergunta: 'Qual a palavra-chave usada para declarar uma classe em C#?', opcoes: ['class', 'struct', 'interface', 'enum'], resposta: 'class' },
          { tipo: 'arrastar-palavras', frase: 'O C# foi criado pela __________.', lacunas: ['Microsoft'] },
          { tipo: 'multipla-escolha', pergunta: 'Qual dos seguintes tipos de dados não existe em C#?', opcoes: ['int', 'float', 'double', 'currency'], resposta: 'currency' },
          { tipo: 'arrastar-palavras', frase: 'As variáveis em C# são __________ tipadas.', lacunas: ['fortemente'] }
        ]
      },
      {
        nome: 'Sintaxe Básica',
        perguntas: [
          { tipo: 'arrastar-palavras', frase: 'Em C#, a principal função é a __________.', lacunas: ['Main'] },
          { tipo: 'multipla-escolha', pergunta: 'Qual operador é usado para comparar igualdade em C#?', opcoes: ['==', '=', '!=', '<>'], resposta: '==' },
          { tipo: 'arrastar-palavras', frase: 'O método __________ imprime na tela.', lacunas: ['Console.WriteLine'] },
          { tipo: 'multipla-escolha', pergunta: 'Qual das opções a seguir é uma estrutura de controle de repetição em C#?', opcoes: ['for', 'while', 'foreach', 'all'], resposta: 'for' },
          { tipo: 'arrastar-palavras', frase: 'Os arrays em C# têm tamanho __________.', lacunas: ['fixo'] }
        ]
      },
    ]
  }
};

let etapaAtual = 0;
let perguntaAtual = 0;
let trilhaAtual = '';
let perguntasTotais = 0;

function abrirTrilha(trilha) {
  trilhaAtual = trilha;
  const trilhaSelecionada = trilhas[trilha];
  const conteudo = document.getElementById('conteudoTrilha');
  
  conteudo.innerHTML = `
    <h2 class="tituloTrilha">${trilhaSelecionada.nome}</h2>
    <div id="etapasContainer" class="etapasContainer"></div>
    <button id="botaoProximaEtapa" class="botaoEtapa">Começar</button>
  `;

  etapaAtual = 0;
  perguntaAtual = 0;
  perguntasTotais = trilhaSelecionada.etapas[etapaAtual].perguntas.length;

  document.getElementById('botaoProximaEtapa').addEventListener('click', avancarEtapa);
}

function avancarEtapa() {
  const container = document.getElementById('etapasContainer');
  const trilhaSelecionada = trilhas[trilhaAtual];

  if (etapaAtual < trilhaSelecionada.etapas.length) {
    container.innerHTML = ''; // Limpa antes de adicionar nova etapa

    const etapa = trilhaSelecionada.etapas[etapaAtual];
    const tituloEtapa = etapa.nome;
    
    const bloco = document.createElement('div');
    bloco.className = 'etapa';
    bloco.style.animation = 'pop 0.4s ease';
    
    const descricao = document.createElement('p');
    descricao.textContent = tituloEtapa;
    descricao.style.marginTop = '0.5rem';
    descricao.style.fontSize = '1.1rem';

    const etapaElement = document.createElement('div');
    etapaElement.appendChild(bloco);
    etapaElement.appendChild(descricao);

    container.appendChild(etapaElement);

    exibirPergunta(container, etapa.perguntas[perguntaAtual]);

    perguntaAtual++;

    if (perguntaAtual === perguntasTotais) {
      const botao = document.getElementById('botaoProximaEtapa');
      botao.textContent = 'Trilha Completa!';
      botao.disabled = true;
      botao.style.background = 'gray';
      botao.style.cursor = 'not-allowed';
    }
  }
}

function exibirPergunta(container, pergunta) {
  if (pergunta.tipo === 'arrastar-palavras') {
    exibirArrastarPalavras(container, pergunta.frase, pergunta.lacunas);
  } else if (pergunta.tipo === 'multipla-escolha') {
    exibirMultiplaEscolha(container, pergunta.pergunta, pergunta.opcoes, pergunta.resposta);
  }
}

function exibirArrastarPalavras(container, fraseOriginal, lacunas) {
  // Exibir a frase com lacunas
  const fraseComLacunas = fraseOriginal.split(' ').map(word => lacunas.includes(word) ? '<span class="lacuna">__________</span>' : word).join(' ');

  const fraseElement = document.createElement('p');
  fraseElement.innerHTML = fraseComLacunas;
  container.appendChild(fraseElement);

  // Preparar as palavras para o arrastar
  const palavrasValidas = lacunas;

  const areaArrastar = document.createElement('div');
  areaArrastar.className = 'dragzone';

  palavrasValidas.forEach(palavra => {
    const span = document.createElement('span');
    span.textContent = palavra;
    span.className = 'drag-item';
    span.draggable = true;

    span.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', span.textContent);
    });

    areaArrastar.appendChild(span);
  });

  // Área de soltar as palavras
  const areaAlvo = document.createElement('div');
  areaAlvo.className = 'dropzone';

  areaAlvo.addEventListener('dragover', e => e.preventDefault());
  areaAlvo.addEventListener('drop', e => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const lacuna = areaAlvo.querySelector('.lacuna');

    if (lacuna) {
      lacuna.textContent = data;
      lacuna.classList.add('filled');

      // Verificar se completou
      if ([...areaAlvo.children].every(l => l.textContent !== '__________')) {
        const resposta = [...areaAlvo.children].map(l => l.textContent).join(' ');
        if (resposta === fraseOriginal) {
          alert('Muito bem!');
          perguntaAtual++;
          atualizarMissoes();
        } else {
          alert('Tente novamente!');
          areaAlvo.innerHTML = '';
          areaArrastar.innerHTML = '';
        }
      }
    }
  });

  container.appendChild(areaArrastar);
  container.appendChild(areaAlvo);
}

function exibirMultiplaEscolha(container, pergunta, opcoes, resposta) {
  const perguntaElement = document.createElement('p');
  perguntaElement.textContent = pergunta;

  const opcoesContainer = document.createElement('div');
  opcoesContainer.className = 'opcoes';

  opcoes.forEach(opcao => {
    const opcaoElement = document.createElement('button');
    opcaoElement.textContent = opcao;
    opcaoElement.className = 'opcao';
    opcaoElement.addEventListener('click', () => {
      if (opcao === resposta) {
        alert('Resposta correta!');
        perguntaAtual++;
        atualizarMissoes();
      } else {
        alert('Resposta errada, tente novamente!');
      }
    });
    opcoesContainer.appendChild(opcaoElement);
  });

  container.appendChild(perguntaElement);
  container.appendChild(opcoesContainer);
}

function atualizarMissoes() {
  document.getElementById('barraDiaria').style.width = '100%';
  document.getElementById('barraDiaria').textContent = '1 / 1';

  const progresso = Math.round((perguntaAtual / perguntasTotais) * 100);
  document.getElementById('barraSemanal').style.width = `${progresso}%`;
  document.getElementById('barraSemanal').textContent = `${perguntaAtual} / ${perguntasTotais}`;
}

// Estilos e animações
const style = document.createElement('style');
style.innerHTML = `
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.tituloTrilha {
  color: #2EF2AA;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.etapasContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.botaoEtapa {
  margin-top: 2rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  background: #2EF2AA;
  color: #0f2b40;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}

.botaoEtapa:hover {
  background-color: #1d9c76;
}

.drag-item {
  padding: 10px;
  margin: 5px;
  background-color: #2EF2AA;
  border-radius: 5px;
  color: #fff;
  font-size: 1.1rem;
  cursor: grab;
}

.drag-item:active {
  cursor: grabbing;
}

.lacuna {
  padding: 10px;
  margin: 5px;
  background-color: #ddd;
  border-radius: 5px;
  font-size: 1.1rem;
  color: transparent;
  border: 2px dashed #aaa;
}

.filled {
  color: #000;
  background-color: #dff0d8;
  border-color: #3c763d;
}

.dropzone {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.opcoes {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.opcao {
  padding: 10px;
  background-color: #2EF2AA;
  border-radius: 5px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}

.opcao:hover {
  background-color: #1d9c76;
}
`;
document.head.appendChild(style);