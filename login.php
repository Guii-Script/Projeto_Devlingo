<?php
// Inclui a configuração centralizada (sessão já é iniciada aqui)
require 'includes/config.php';
$erro = '';

// Se o usuário já estiver logado, redireciona para as trilhas
if (isset($_SESSION['usuario_id'])) {
    header('Location: trilhas.php');
    exit();
}

// LÓGICA DE LOGIN
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        $erro = 'Por favor, preencha todos os campos.';
    } else {
        $stmt = $pdo->prepare("SELECT id, senha FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();

        // Verifica se o usuário existe e se a senha está correta
        if ($usuario && password_verify($senha, $usuario['senha'])) {
            // Se tudo estiver certo, armazena o ID do usuário na sessão
            $_SESSION['usuario_id'] = $usuario['id'];
            
            // Atualiza o último acesso (opcional, mas boa prática)
            $updateStmt = $pdo->prepare("UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?");
            $updateStmt->execute([$usuario['id']]);

            // Redireciona para a página de trilhas
            header('Location: trilhas.php');
            exit(); // Encerra o script após o redirecionamento
        } else {
            $erro = 'E-mail ou senha incorretos.';
        }
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

    <form id="loginForm" method="POST" action="login.php">
      <div class="form-group">
        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" class="login-input" placeholder="Digite seu e-mail" required>
      </div>

      <div class="form-group">
        <label for="senha">Senha</label>
        <input type="password" id="senha" name="senha" class="login-input" placeholder="Digite sua senha" required>
      </div>

      <button type="submit" class="botao-login">
        ENTRAR
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
    // Todo o seu JavaScript para animações continua aqui, sem alterações.
    // Cole o script da sua versão original aqui.
    // Removi as animações de submit complexas para simplificar o debug, 
    // mas você pode mantê-las se quiser. O importante é o backend funcionar.
  </script>
</body>
</html>