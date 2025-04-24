let progressoDiario = 0;
let progressoSemanal = 0;

const trilhas = {
  "C#": [
    {
      pergunta: "Qual palavra-chave usamos para declarar uma variável em C#?",
      opcoes: ["var", "int", "let", "const"],
      correta: 0
    },
    {
      pergunta: "Qual é o tipo de dado usado para texto em C#?",
      opcoes: ["char", "string", "text", "String"],
      correta: 1
    },
    {
      pergunta: "Como iniciamos um loop em C#?",
      opcoes: ["for i=0", "foreach", "loop", "repeat"],
      correta: 1
    },
    {
      pergunta: "Qual símbolo usamos para comentar uma linha?",
      opcoes: ["//", "#", "--", "/*"],
      correta: 0
    },
    {
      pergunta: "C# é uma linguagem...",
      opcoes: ["Interpretada", "Compilada", "Script", "Binária"],
      correta: 1
    }
  ],
  // Adicione mais trilhas aqui...
};

let respostasUsuario = [];
let indiceQuestao = 0;
let trilhaAtual = "";

function abrirTrilha(nome) {
  trilhaAtual = nome;
  respostasUsuario = new Array(trilhas[nome].length).fill(null);
  indiceQuestao = 0;
  renderizarQuestao();
}

function renderizarQuestao() {
  const questao = trilhas[trilhaAtual][indiceQuestao];
  const conteudo = document.getElementById("conteudoTrilha");

  let opcoesHTML = questao.opcoes.map((opcao, i) => `
    <label style="display:block; background-color: #113652; margin: 0.5rem 0; padding: 0.7rem; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;"
      class="${respostasUsuario[indiceQuestao] === i ? 'etapa-concluida' : ''}">
      <input type="radio" name="opcao" value="${i}" ${respostasUsuario[indiceQuestao] === i ? 'checked' : ''} style="margin-right: 10px;">
      ${opcao}
    </label>
  `).join("");

  conteudo.innerHTML = `
    <div style="background-color: #122b44; padding: 1.5rem; border-radius: 20px; font-weight: bold; margin-bottom: 1rem; font-size: 1.5rem;">
      ${trilhaAtual.toUpperCase()} - QUESTÃO ${indiceQuestao + 1}
    </div>
    <div style="margin-bottom: 1rem; font-size: 1.2rem;">${questao.pergunta}</div>
    <form id="formQuestao">${opcoesHTML}</form>
    <div style="margin-top: 1rem;">
      ${indiceQuestao > 0 ? '<button onclick="anterior()" class="botao-trilha" style="margin-right: 1rem;">Anterior</button>' : ''}
      ${indiceQuestao < trilhas[trilhaAtual].length - 1 
        ? '<button onclick="proxima()" class="botao-trilha">Próxima</button>'
        : '<button onclick="finalizar()" class="botao-trilha">Finalizar</button>'
      }
    </div>
  `;
}

function proxima() {
  salvarResposta();
  if (indiceQuestao < trilhas[trilhaAtual].length - 1) {
    indiceQuestao++;
    renderizarQuestao();
  }
}

function anterior() {
  salvarResposta();
  if (indiceQuestao > 0) {
    indiceQuestao--;
    renderizarQuestao();
  }
}

function salvarResposta() {
  const form = document.getElementById("formQuestao");
  const selecionada = form.opcao?.value;
  if (selecionada !== undefined) {
    respostasUsuario[indiceQuestao] = parseInt(selecionada);
  }
}

function finalizar() {
  salvarResposta();
  const questoes = trilhas[trilhaAtual];
  const todasCorretas = respostasUsuario.every((resp, i) => resp === questoes[i].correta);

  const conteudo = document.getElementById("conteudoTrilha");

  if (todasCorretas) {
    conteudo.innerHTML = `<div style="font-size: 2rem; color: #00ffa6; padding: 2rem; border-radius: 20px; background-color: #122b44;">Parabéns! Você concluiu a trilha com sucesso 🎉</div>`;
    
    if (progressoDiario < 1) {
      progressoDiario++;
      document.getElementById("barraDiaria").style.width = "100%";
      document.getElementById("barraDiaria").textContent = "1 / 1";
    }

    if (progressoSemanal < 5) {
      progressoSemanal++;
      let porcentagem = (progressoSemanal / 5) * 100;
      document.getElementById("barraSemanal").style.width = porcentagem + "%";
      document.getElementById("barraSemanal").textContent = `${progressoSemanal} / 5`;
    }

  } else {
    conteudo.innerHTML = `
      <div style="font-size: 2rem; color: #ff5f5f; padding: 2rem; background-color: #1a1a1a; border-radius: 20px; animation: shake 0.4s;">
        Algumas respostas estão incorretas 😢<br>Tente novamente!
      </div>
    `;
    setTimeout(() => abrirTrilha(trilhaAtual), 1800);
  }
}

// Animação shake (adicione no seu CSS)
const estiloShake = document.createElement("style");
estiloShake.innerHTML = `
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
`;
document.head.appendChild(estiloShake);