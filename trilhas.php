<?php
  // Inclui a configuração centralizada (inicia a sessão e conecta ao banco)
  require_once 'includes/config.php';

  // Verifica se o usuário está logado, senão, redireciona
  if (!isset($_SESSION['usuario_id'])) {
      header('Location: login.php');
      exit();
  }

  $usuario_id = $_SESSION['usuario_id']; // Define usuario_id para uso

  // Busca os dados atuais do usuário, incluindo a coluna tempo_recarga e avatar
  $stmt = $pdo->prepare("SELECT vidas, streak, moedas, tempo_recarga, avatar FROM usuarios WHERE id = ?");
  $stmt->execute([$_SESSION['usuario_id']]);
  $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

  // Define as variáveis que serão usadas no HTML, usando isset() para compatibilidade PHP < 7.0
  $vidas = isset($usuario['vidas']) ? $usuario['vidas'] : 3;
  $streak = isset($usuario['streak']) ? $usuario['streak'] : 0;
  $moedas = isset($usuario['moedas']) ? $usuario['moedas'] : 0;
  $tempo_recarga = isset($usuario['tempo_recarga']) ? $usuario['tempo_recarga'] : null;

  // Define a variável $avatar_url para o header.php
  $avatar_url = isset($usuario['avatar']) ? $usuario['avatar'] : 'https://i.imgur.com/W8yZNOX.png';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devlingo - Trilhas</title>
  <link rel="stylesheet" href="CSS/trilhas.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</head>
<body>

  <div id="gameOverOverlay" class="game-over-overlay hidden">
      <div class="game-over-box">
          <h1 class="game-over-text">GAME OVER</h1>
          <p class="game-over-subtext">Suas vidas recarregarão em:</p>
          <div id="gameOverTimer" class="game-over-timer">01:00</div>
      </div>
  </div>

  <?php include_once 'includes/header.php'; ?>

  <div class="main-container">
    <aside class="sidebar">
      <div class="sidebar-content">
        <div id="listaTrilhas" class="trilhas-menu"></div>
      </div>
    </aside>

    <main class="content">
      <section id="conteudoTrilha" class="trilha-content"></section>

      <section class="missions">
        <div class="status-container">
          <div class="status-jogador"
               data-vidas="<?php echo $vidas; ?>"
               data-streak="<?php echo $streak; ?>"
               data-moedas="<?php echo $moedas; ?>"
               data-tempo-recarga="<?php echo htmlspecialchars($tempo_recarga); ?>">

            <div class="status-item">
              <span class="icone"><i class="fas fa-heart"></i></span>
              <span id="vidas"><?php echo $vidas; ?></span>
            </div>
            <div class="status-item">
              <span class="icone"><i class="fas fa-fire"></i></span>
              <span id="streak"><?php echo $streak; ?></span>
            </div>
            <div class="status-item">
              <span class="icone"><i class="fas fa-gem"></i></span>
              <span id="moedas"><?php echo $moedas; ?></span>
            </div>
          </div>

          <div id="missoesDiariasContainer">
            </div>


        </div>
      </section>
    </main>
  </div>

  <script src="JS/trilhas.js"></script>
</body>
</html>