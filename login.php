<?php
session_start();
$erro = '';

// CONFIGURAÇÃO DO BANCO
$host = 'localhost';
$db   = 'devlingo';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die("Erro ao conectar ao banco de dados.");
}

// LOGIN
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();

    if ($usuario && password_verify($senha, $usuario['senha'])) {
        $_SESSION['usuario_id'] = $usuario['id'];
        echo "<script>
            setTimeout(() => {
              window.location.href = 'trilhas.php';
            }, 100);  // Alterado de 1000 para 3000 (3 segundos)
        </script>";
    } else {
        $erro = 'E-mail ou senha incorretos.';
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Devlingo - Login</title>
  <link rel="stylesheet" href="CSS/login.css"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>
</head>
<body>
  <div class="particles" id="particles"></div>

  <div class="login-container" id="loginContainer">
    <div class="login-logo">
      <i class="fas fa-code"></i>
      <h1>Dev_lingo</h1>
    </div>

    <p class="login-subtitle">Preencha os campos abaixo para acessar sua conta</p>

    <?php if ($erro): ?>
      <p style="color: #ff3333; text-align:center; margin-bottom:1rem; font-weight: bold;">
        <?= htmlspecialchars($erro) ?>
      </p>
    <?php endif; ?>

    <form id="loginForm" method="POST" action="">
      <div class="form-group">
        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" class="login-input" placeholder="Digite seu e-mail" required>
      </div>

      <div class="form-group">
        <label for="senha">Senha</label>
        <input type="password" id="senha" name="senha" class="login-input" placeholder="Digite sua senha" required>
      </div>

      <button type="submit" class="botao-login" id="botaoEntrar">
        <span id="botaoTexto">ENTRAR</span>
      </button>

      <div class="login-divider">
        <span>ou</span>
      </div>

      <button type="button" class="botao-google">
        <i class="fab fa-google"></i> Continuar com Google
      </button>
    </form>

    <div class="login-links">
      <a href="cadastro.php" class="login-link">Primeiro acesso? Cadastre-se</a>
      <a href="#" class="login-link">Esqueceu sua senha?</a>
    </div>
  </div>

  <script>
    function criarParticulas() {
      const container = document.getElementById('particles');
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
        container.appendChild(particle);
      }
    }

    function lancarConfetti() {
      const colors = ['#2EF2AA', '#25d895', '#1dc084', '#15a873'];
      const container = document.getElementById('loginContainer');
      for (let i = 0; i < 100; i++) {  // Aumentei de 50 para 100 confetes
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${Math.random() * 10 + 5}px`;  // Aumentei o tamanho máximo
        confetti.style.height = `${Math.random() * 10 + 5}px`; // Aumentei o tamanho máximo
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-10px';
        const duration = Math.random() * 2 + 3;  // 3-5 segundos de duração
        confetti.style.animation = `confetti-fall ${duration}s linear forwards`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(confetti);

        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(600px) rotate(${Math.random() * 360}deg); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
        setTimeout(() => { confetti.remove(); style.remove(); }, duration * 1000);
      }
    }

    document.getElementById('loginForm').addEventListener('submit', function(e) {
      const email = document.getElementById('email');
      const senha = document.getElementById('senha');
      const botaoEntrar = document.getElementById('botaoEntrar');
      const botaoTexto = document.getElementById('botaoTexto');

      if (email.value === '' || senha.value === '') {
        e.preventDefault();
        if (email.value === '') {
          email.classList.add('error-animation');
          setTimeout(() => email.classList.remove('error-animation'), 1000);
        }
        if (senha.value === '') {
          senha.classList.add('error-animation');
          setTimeout(() => senha.classList.remove('error-animation'), 1000);
        }
        document.getElementById('loginContainer').style.animation = 'shake 0.5s';
        setTimeout(() => {
          document.getElementById('loginContainer').style.animation = '';
        }, 500);
      } else {
        e.preventDefault(); // Adicionei para garantir que o formulário não seja enviado antes da animação
        botaoTexto.textContent = 'CARREGANDO...';
        botaoEntrar.disabled = true;
        lancarConfetti();
        document.getElementById('loginContainer').style.animation = 'pulse 0.5s';
        
        // Envia o formulário após 2.5 segundos (para dar tempo da animação)
        setTimeout(() => {
          this.submit();
        }, 2500);
      }
    });

    window.addEventListener('load', () => {
      criarParticulas();
      const container = document.getElementById('loginContainer');
      container.style.opacity = '0';
      container.style.transform = 'translateY(20px)';
      container.style.transition = 'all 0.10s ease';
      setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, 100);
    });
  </script>
</body>
</html>