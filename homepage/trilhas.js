const trilhas = {
  'C#': {
    nome: 'Trilha C#',
    etapas: ['Introdução ao C#', 'Sintaxe Básica', 'POO em C#', 'ASP.NET Core', 'APIs REST com C#']
  },
  'HTML': {
    nome: 'Trilha HTML',
    etapas: ['Estrutura HTML', 'Formulários', 'Semântica', 'Acessibilidade', 'Boas práticas']
  },
  'PHP': {
    nome: 'Trilha PHP',
    etapas: ['Introdução ao PHP', 'Sintaxe PHP', 'Banco de Dados', 'PHP Avançado', 'Boas práticas']
  },
  'JavaScript': {
    nome: 'Trilha JavaScript',
    etapas: ['Variáveis e Tipos', 'Funções', 'DOM', 'Eventos', 'APIs']
  },
  'Database': {
    nome: 'Trilha Database',
    etapas: ['Modelagem de Dados', 'SQL Básico', 'Consultas Avançadas', 'Stored Procedures', 'Otimização']
  }
};

let etapaAtual = 0;
let etapasTotais = 0;
let trilhaAtual = '';

function abrirTrilha(trilha) {
  trilhaAtual = trilha;
  const trilhaSelecionada = trilhas[trilha];
  const conteudo = document.getElementById('conteudoTrilha');
  
  conteudo.innerHTML = `
    <h2 style="color: #2EF2AA; margin-bottom: 2rem; font-size: 2rem;">${trilhaSelecionada.nome}</h2>
    <div id="etapasContainer" style="display: flex; flex-direction: column; align-items: center; gap: 2rem;"></div>
    <button id="botaoProximaEtapa" style="margin-top: 2rem; padding: 1rem 2rem; border: none; border-radius: 10px; background: #2EF2AA; color: #0f2b40; font-weight: bold; font-size: 1rem; cursor: pointer; transition: 0.3s;">Começar</button>
  `;

  etapaAtual = 0;
  etapasTotais = trilhaSelecionada.etapas.length;

  const botao = document.getElementById('botaoProximaEtapa');
  botao.addEventListener('click', avancarEtapa);
}

function avancarEtapa() {
  const container = document.getElementById('etapasContainer');
  const trilhaSelecionada = trilhas[trilhaAtual];
  
  if (etapaAtual < etapasTotais) {
    // Criar etapa animada
    const etapa = document.createElement('div');
    etapa.className = 'etapa';
    etapa.textContent = etapaAtual + 1;
    etapa.style.animation = 'pop 0.4s ease';
    
    const descricao = document.createElement('p');
    descricao.textContent = trilhaSelecionada.etapas[etapaAtual];
    descricao.style.marginTop = '0.5rem';
    descricao.style.fontSize = '1.1rem';

    const bloco = document.createElement('div');
    bloco.style.display = 'flex';
    bloco.style.flexDirection = 'column';
    bloco.style.alignItems = 'center';
    bloco.style.justifyContent = 'center';
    bloco.appendChild(etapa);
    bloco.appendChild(descricao);

    container.appendChild(bloco);

    etapaAtual++;
    atualizarMissoes();

    if (etapaAtual === etapasTotais) {
      const botao = document.getElementById('botaoProximaEtapa');
      botao.textContent = 'Trilha Completa!';
      botao.disabled = true;
      botao.style.background = 'gray';
      botao.style.cursor = 'not-allowed';
    }
  }
}

function atualizarMissoes() {
  // Atualizar barra de progresso diária (1 aula = 100%)
  const diaria = document.getElementById('barraDiaria');
  diaria.style.width = '100%';
  diaria.textContent = '1 / 1';

  // Atualizar barra de progresso semanal (1 trilha = 5 etapas)
  const semanal = document.getElementById('barraSemanal');
  const progressoSemanal = Math.round((etapaAtual / etapasTotais) * 100);
  semanal.style.width = `${progressoSemanal}%`;
  semanal.textContent = `${etapaAtual} / ${etapasTotais}`;
}

// Pequena animação para "pop" quando adiciona etapa
const style = document.createElement('style');
style.innerHTML = `
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
`;
document.head.appendChild(style);


/*
const trilhas = {
  'C#': {
    nome: 'Trilha C#',
    atividades: [
      {
        titulo: 'Introdução ao C#',
        perguntas: [
          { pergunta: 'Qual extensão de arquivos C#?', opcoes: ['.js', '.cs', '.php', '.html'], correta: 1 },
          { pergunta: 'Qual palavra-chave para variável em C#?', opcoes: ['var', 'let', 'const', 'def'], correta: 0 },
          { pergunta: 'Qual é um tipo primitivo em C#?', opcoes: ['integer', 'bool', 'string', 'char'], correta: 1 },
          { pergunta: 'Qual estrutura condicional existe em C#?', opcoes: ['switch', 'choose', 'select', 'option'], correta: 0 },
          { pergunta: 'Para que serve o namespace?', opcoes: ['Controlar classes', 'Comentar', 'Ignorar erros', 'Importar CSS'], correta: 0 },
        ]
      },
      {
        titulo: 'Sintaxe Básica',
        perguntas: [
          { pergunta: 'Como declarar uma função?', opcoes: ['func', 'function', 'void', 'define'], correta: 2 },
          { pergunta: 'Operador lógico "E" em C# é?', opcoes: ['&&', '||', '==', '!='], correta: 0 },
          { pergunta: 'Qual estrutura para repetição?', opcoes: ['loop', 'for', 'repeat', 'cycle'], correta: 1 },
          { pergunta: 'Qual símbolo fecha instruções?', opcoes: [';', ':', '.', ','], correta: 0 },
          { pergunta: 'Qual é tipo de dado para textos?', opcoes: ['char', 'text', 'string', 'var'], correta: 2 },
        ]
      },
      // (Você pode adicionar mais atividades)
    ]
  }
  // (Adicionar outras trilhas aqui)
};

let trilhaSelecionada = null;
let atividadeAtual = 0;
let perguntaAtual = 0;
let acertos = 0;

function abrirTrilha(nomeTrilha) {
  trilhaSelecionada = trilhas[nomeTrilha];
  atividadeAtual = 0;
  perguntaAtual = 0;
  acertos = 0;
  carregarAtividade();
}

function carregarAtividade() {
  const atividade = trilhaSelecionada.atividades[atividadeAtual];
  const conteudo = document.getElementById('conteudoTrilha');

  conteudo.innerHTML = `
    <h2 style="color: #2EF2AA;">${trilhaSelecionada.nome}</h2>
    <h3 style="margin-top: 1rem;">Atividade: ${atividade.titulo}</h3>
    <div id="perguntaContainer" style="margin-top: 2rem;"></div>
    <button id="botaoProxima" style="margin-top: 2rem; padding: 0.8rem 2rem; background-color: #2EF2AA; color: #0f2b40; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">Começar</button>
  `;

  document.getElementById('botaoProxima').onclick = mostrarPergunta;
}

function mostrarPergunta() {
  const atividade = trilhaSelecionada.atividades[atividadeAtual];
  const perguntaObj = atividade.perguntas[perguntaAtual];
  const container = document.getElementById('perguntaContainer');

  container.innerHTML = `
    <div style="margin-bottom: 1rem; font-weight: bold;">${perguntaObj.pergunta}</div>
    ${perguntaObj.opcoes.map((opcao, index) => `
      <button onclick="responder(${index})" style="display: block; margin: 0.5rem auto; padding: 0.8rem; width: 80%; background-color: #0f2b40; color: #2EF2AA; border: 1px solid #2EF2AA; border-radius: 8px; cursor: pointer;">${opcao}</button>
    `).join('')}
  `;

  const botao = document.getElementById('botaoProxima');
  botao.style.display = 'none'; // Esconde o botão até responder
}

function responder(indice) {
  const atividade = trilhaSelecionada.atividades[atividadeAtual];
  const perguntaObj = atividade.perguntas[perguntaAtual];

  if (indice === perguntaObj.correta) {
    acertos++;
  }

  perguntaAtual++;

  if (perguntaAtual < atividade.perguntas.length) {
    mostrarPergunta();
  } else {
    finalizarAtividade();
  }
}

function finalizarAtividade() {
  const atividade = trilhaSelecionada.atividades[atividadeAtual];
  const conteudo = document.getElementById('conteudoTrilha');

  if (acertos === atividade.perguntas.length) {
    conteudo.innerHTML = `
      <h2 style="color: #00ffa6;">✅ Você completou a atividade "${atividade.titulo}"!</h2>
      <button onclick="proximaAtividade()" style="margin-top: 2rem; padding: 0.8rem 2rem; background-color: #2EF2AA; color: #0f2b40; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">Próxima Atividade</button>
    `;
  } else {
    conteudo.innerHTML = `
      <h2 style="color: #f87171;">❌ Você errou algumas perguntas.</h2>
      <button onclick="refazerAtividade()" style="margin-top: 2rem; padding: 0.8rem 2rem; background-color: #f97316; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">Tentar Novamente</button>
    `;
  }
}

function proximaAtividade() {
  atividadeAtual++;
  perguntaAtual = 0;
  acertos = 0;

  if (atividadeAtual < trilhaSelecionada.atividades.length) {
    carregarAtividade();
  } else {
    document.getElementById('conteudoTrilha').innerHTML = `
      <h2 style="color: #00ffa6;">🎉 Parabéns! Você completou toda a trilha ${trilhaSelecionada.nome}!</h2>
    `;
  }
}

function refazerAtividade() {
  perguntaAtual = 0;
  acertos = 0;
  carregarAtividade();
}

*/