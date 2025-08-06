<?php
require_once 'includes/config.php';

$erro = '';
$login_sucesso = false;

if (isset($_SESSION['usuario_id'])) {
    header('Location: trilhas.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $senha = isset($_POST['senha']) ? $_POST['senha'] : '';

    if (empty($email) || empty($senha)) {
        $erro = 'Por favor, preencha todos os campos.';
    } else {
        $stmt = $pdo->prepare("SELECT id, senha FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();

        if ($usuario && password_verify($senha, $usuario['senha'])) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $login_sucesso = true;
        } else {
            $erro = 'E-mail ou senha incorretos.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <?php include 'includes/head.php'; ?>
    <title>Devlingo - Login</title>
    <link rel="stylesheet" href="CSS/login.css"/>
</head>
<body>
  <!-- Fundo animado restaurado -->
  <div id="particulas-fundo" class="particulas-fundo"></div>

  <div id="container-login" class="container-login">
    <div class="logo-login">
      <i class="fas fa-code"></i>
      <h1>Dev_lingo</h1>
    </div>

    <p class="subtitulo-login">Preencha os campos para acessar sua conta</p>

    <?php if ($erro): ?>
      <p class="mensagem-erro"><?= htmlspecialchars($erro) ?></p>
    <?php endif; ?>

    <form id="form-login" method="POST" action="login.php">
      <div class="grupo-formulario">
        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" class="input-login" placeholder="Digite seu e-mail" required>
      </div>
      <div class="grupo-formulario">
        <label for="senha">Senha</label>
        <input type="password" id="senha" name="senha" class="input-login" placeholder="Digite sua senha" required>
      </div>
      <button type="submit" id="botao-login" class="botao-login">ENTRAR</button>
    </form>

    <div class="divisor"><span>ou</span></div>
    
    <div class="links-login">
      <a href="cadastro.php" class="link-login">Primeiro acesso? Cadastre-se</a>
      <a href="#" class="link-login">Esqueceu sua senha?</a>
    </div>
  </div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const formLogin = document.getElementById('form-login');
    const botaoLogin = document.getElementById('botao-login');

    // FUNÇÃO PARA CRIAR PARTÍCULAS 
    function criarParticulas() {
        const container = document.getElementById('particulas-fundo');
        if (!container) return;
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particula = document.createElement('div');
            particula.classList.add('particula');
            
            const size = Math.random() * 4 + 2;
            particula.style.width = `${size}px`;
            particula.style.height = `${size}px`;
            particula.style.left = `${Math.random() * 100}%`;
            particula.style.top = `${Math.random() * 100}%`;
            particula.style.animationDelay = `${Math.random() * 10}s`;
            particula.style.animationDuration = `${Math.random() * 10 + 5}s`;
            
            container.appendChild(particula);
        }
    }

    // FUNÇÃO DE CONFETES
    function lancarConfetes() {
        const container = document.getElementById('container-login');
        if (!container) return;
        const cores = ['#2EF2AA', '#25d895', '#1dc084'];
        
        for (let i = 0; i < 100; i++) {
            const confete = document.createElement('div');
            confete.className = 'confete';
            confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
            confete.style.left = Math.random() * 100 + '%';
            confete.style.animationDelay = Math.random() * 2 + 's';
            const size = Math.random() * 8 + 4;
            confete.style.width = `${size}px`;
            confete.style.height = `${size}px`;

            container.appendChild(confete);

            setTimeout(() => {
                confete.remove();
            }, 3000);
        }
    }
    
    // INICIALIZA AS PARTÍCULAS
    criarParticulas();

    <?php if ($login_sucesso): ?>
        lancarConfetes();
        botaoLogin.textContent = 'SUCESSO!';
        setTimeout(() => {
            window.location.href = 'trilhas.php';
        }, 1500);
    <?php endif; ?>

    formLogin.addEventListener('submit', function(e) {
        if (<?php echo $login_sucesso ? 'true' : 'false'; ?>) {
            e.preventDefault();
            return;
        }
        botaoLogin.disabled = true;
        botaoLogin.textContent = 'ENTRANDO...';
    });
});
</script>
</body>
</html>
