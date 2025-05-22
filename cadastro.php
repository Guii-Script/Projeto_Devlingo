<?php
require 'includes/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = filter_input(INPUT_POST, 'nome', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $senha = $_POST['senha'];
    $confirmar_senha = $_POST['confirmar-senha'];
    
    // Validações
    if (empty($nome) || empty($email) || empty($senha) || empty($confirmar_senha)) {
        $erro = 'Por favor, preencha todos os campos';
    } elseif ($senha !== $confirmar_senha) {
        $erro = 'As senhas não coincidem';
    } elseif (strlen($senha) < 8) {
        $erro = 'A senha deve ter pelo menos 8 caracteres';
    } else {
        // Verifica se o email já existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            $erro = 'Este e-mail já está cadastrado';
        } else {
            // Hash da senha
            $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
            
            // Insere o usuário no banco
            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, data_cadastro) VALUES (?, ?, ?, NOW())");
            if ($stmt->execute([$nome, $email, $senha_hash])) {
                $sucesso = 'Cadastro realizado com sucesso! Redirecionando para login...';
                header("refresh:2;url=login.php");
            } else {
                $erro = 'Erro ao cadastrar. Por favor, tente novamente.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devlingo - Cadastro</title>
  <link rel="stylesheet" href="CSS/cadastro.css">  
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
  <div class="particles" id="particles"></div>
  
  <div class="cadastro-container" id="cadastroContainer">
    <?php if (isset($erro)): ?>
      <div class="mensagem erro"><?= htmlspecialchars($erro) ?></div>
    <?php endif; ?>
    
    <?php if (isset($sucesso)): ?>
      <div class="mensagem sucesso"><?= htmlspecialchars($sucesso) ?></div>
    <?php endif; ?>
    
    <div class="cadastro-logo">
      <i class="fas fa-code"></i>
      <h1>Dev_lingo</h1>
    </div>
    
    <p class="cadastro-subtitle">Crie sua conta e comece sua jornada de aprendizado</p>
    
    <form id="cadastroForm" method="POST" action="cadastro.php">
      <div class="form-group">
        <label for="nome">Nome Completo</label>
        <input type="text" id="nome" name="nome" class="cadastro-input" placeholder="Digite seu nome completo" required>
        <i class="fas fa-check validation-tooltip"></i>
      </div>
      
      <div class="form-group">
        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" class="cadastro-input" placeholder="Digite seu e-mail" required>
        <i class="fas fa-check validation-tooltip"></i>
      </div>
      
      <div class="form-group">
        <label for="senha">Senha</label>
        <input type="password" id="senha" name="senha" class="cadastro-input" placeholder="Crie uma senha segura" required>
        <i class="fas fa-check validation-tooltip"></i>
        
        <div class="password-strength">
          <div class="strength-bar" id="strengthBar"></div>
        </div>
        
        <div class="password-checklist" id="passwordChecklist">
          <div class="checklist-item" id="lengthCheck">
            <i class="far fa-circle"></i>
            <span>Mínimo 8 caracteres</span>
          </div>
          <div class="checklist-item" id="numberCheck">
            <i class="far fa-circle"></i>
            <span>Pelo menos 1 número</span>
          </div>
          <div class="checklist-item" id="specialCheck">
            <i class="far fa-circle"></i>
            <span>Pelo menos 1 caractere especial</span>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="confirmar-senha">Confirmar Senha</label>
        <input type="password" id="confirmar-senha" name="confirmar-senha" class="cadastro-input" placeholder="Confirme sua senha" required>
        <i class="fas fa-check validation-tooltip"></i>
      </div>
      
      <button type="submit" class="botao-cadastro" id="botaoCadastro">
        <span id="botaoTexto">CRIAR CONTA</span>
      </button>
    </form>
    
    <div class="cadastro-divider">
      <span>ou</span>
    </div>
    
    <button type="button" class="botao-google">
      <i class="fab fa-google"></i> Cadastre-se com Google
    </button>
    
    <div class="cadastro-links">
      <a href="login.php" class="cadastro-link">Já tem uma conta? Faça login</a>
    </div>
  </div>

  <script>
    // Seu JavaScript original permanece exatamente igual
    // Criar partículas de fundo
    function criarParticulas() {
      const container = document.getElementById('particles');
      const particleCount = 20;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Tamanho aleatório entre 2px e 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Posição aleatória
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Atraso aleatório na animação
        particle.style.animationDelay = `${Math.random() * 10}s`;
        
        // Duração aleatória da animação
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
        
        container.appendChild(particle);
      }
    }
    
    // Efeito de confete
    function lancarConfetti() {
      const colors = ['#2EF2AA', '#25d895', '#1dc084', '#15a873'];
      const container = document.getElementById('cadastroContainer');
      
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Estilo do confete
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${Math.random() * 8 + 4}px`;
        confetti.style.height = `${Math.random() * 8 + 4}px`;
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-10px';
        
        // Animação
        const animationDuration = Math.random() * 3 + 2;
        confetti.style.animation = `confetti-fall ${animationDuration}s linear forwards`;
        
        // Rotação aleatória
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        // Adicionar ao container
        container.appendChild(confetti);
        
        // Definir keyframes dinamicamente
        const keyframes = `
          @keyframes confetti-fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(500px) rotate(${Math.random() * 360}deg);
              opacity: 0;
            }
          }
        `;
        
        const style = document.createElement('style');
        style.innerHTML = keyframes;
        document.head.appendChild(style);
        
        // Remover após a animação
        setTimeout(() => {
          confetti.remove();
          style.remove();
        }, animationDuration * 1000);
      }
    }
    
    // Validar força da senha
    function validarForcaSenha(senha) {
      const strengthBar = document.getElementById('strengthBar');
      let strength = 0;
      
      // Verificar critérios
      const hasLength = senha.length >= 8;
      const hasNumber = /\d/.test(senha);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
      
      // Atualizar checklist
      document.getElementById('lengthCheck').classList.toggle('valid', hasLength);
      document.getElementById('lengthCheck').querySelector('i').className = hasLength ? 'fas fa-check-circle' : 'far fa-circle';
      
      document.getElementById('numberCheck').classList.toggle('valid', hasNumber);
      document.getElementById('numberCheck').querySelector('i').className = hasNumber ? 'fas fa-check-circle' : 'far fa-circle';
      
      document.getElementById('specialCheck').classList.toggle('valid', hasSpecial);
      document.getElementById('specialCheck').querySelector('i').className = hasSpecial ? 'fas fa-check-circle' : 'far fa-circle';
      
      // Calcular força
      if (hasLength) strength += 30;
      if (hasNumber) strength += 30;
      if (hasSpecial) strength += 40;
      
      // Atualizar barra de progresso
      strengthBar.style.width = `${strength}%`;
      
      // Atualizar cor baseada na força
      if (strength < 30) {
        strengthBar.style.backgroundColor = 'var(--cor-erro)';
      } else if (strength < 70) {
        strengthBar.style.backgroundColor = 'orange';
      } else {
        strengthBar.style.backgroundColor = 'var(--cor-primaria)';
      }
      
      return strength >= 70;
    }
    
    // Validar formulário
    document.getElementById('cadastroForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nome = document.getElementById('nome');
      const email = document.getElementById('email');
      const senha = document.getElementById('senha');
      const confirmarSenha = document.getElementById('confirmar-senha');
      const botaoCadastro = document.getElementById('botaoCadastro');
      const botaoTexto = document.getElementById('botaoTexto');
      
      let isValid = true;
      
      // Validar campos vazios
      if (nome.value === '') {
        nome.classList.add('error-animation');
        setTimeout(() => nome.classList.remove('error-animation'), 1500);
        isValid = false;
      }
      
      if (email.value === '') {
        email.classList.add('error-animation');
        setTimeout(() => email.classList.remove('error-animation'), 1500);
        isValid = false;
      }
      
      if (senha.value === '') {
        senha.classList.add('error-animation');
        setTimeout(() => senha.classList.remove('error-animation'), 1500);
        isValid = false;
      }
      
      if (confirmarSenha.value === '') {
        confirmarSenha.classList.add('error-animation');
        setTimeout(() => confirmarSenha.classList.remove('error-animation'), 1500);
        isValid = false;
      }
      
      // Validar força da senha
      const isStrongPassword = validarForcaSenha(senha.value);
      
      if (!isStrongPassword) {
        senha.classList.add('error-animation');
        setTimeout(() => senha.classList.remove('error-animation'), 1500);
        isValid = false;
      }
      
      // Validar correspondência de senhas
      if (senha.value !== confirmarSenha.value) {
        senha.classList.add('error-animation');
        confirmarSenha.classList.add('error-animation');
        setTimeout(() => {
          senha.classList.remove('error-animation');
          confirmarSenha.classList.remove('error-animation');
        }, 1500);
        isValid = false;
      }
      
      if (isValid) {
        // Efeito de sucesso
        nome.classList.add('success-animation');
        email.classList.add('success-animation');
        senha.classList.add('success-animation');
        confirmarSenha.classList.add('success-animation');
        
        // Mudar texto do botão
        botaoTexto.textContent = 'CRIANDO CONTA...';
        botaoCadastro.disabled = true;
        
        // Enviar o formulário
        this.submit();
      } else {
        // Efeito de tremer o container
        document.getElementById('cadastroContainer').style.animation = 'shake 0.5s';
        setTimeout(() => {
          document.getElementById('cadastroContainer').style.animation = '';
        }, 500);
      }
    });
    
    // Validar senha em tempo real
    document.getElementById('senha').addEventListener('input', function() {
      validarForcaSenha(this.value);
    });
    
    // Inicializar
    window.addEventListener('load', () => {
      criarParticulas();
      
      // Efeito de entrada
      document.getElementById('cadastroContainer').style.opacity = '0';
      document.getElementById('cadastroContainer').style.transform = 'translateY(20px)';
      document.getElementById('cadastroContainer').style.transition = 'all 0.5s ease';
      
      setTimeout(() => {
        document.getElementById('cadastroContainer').style.opacity = '1';
        document.getElementById('cadastroContainer').style.transform = 'translateY(0)';
      }, 100);
    });
  </script>
</body>
</html>