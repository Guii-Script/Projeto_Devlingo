<?php
  // Inclui a configuração centralizada (inicia a sessão e conecta ao banco)
  require_once 'includes/config.php';

  // Verifica se o usuário está logado, senão, redireciona
  if (!isset($_SESSION['usuario_id'])) {
      header('Location: login.php'); 
      exit();
  }

  // Busca os dados atuais do usuário, incluindo a coluna tempo_recarga
  $stmt = $pdo->prepare("SELECT vidas, streak, moedas, tempo_recarga FROM usuarios WHERE id = ?");
  $stmt->execute([$_SESSION['usuario_id']]);
  $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

  // Define as variáveis que serão usadas no HTML
  $vidas = $usuario ? $usuario['vidas'] : 3;
  $streak = $usuario ? $usuario['streak'] : 0;
  $moedas = $usuario ? $usuario['moedas'] : 0;
  $tempo_recarga = $usuario ? $usuario['tempo_recarga'] : null;
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

  <header>
    <div class="header-content">
      <nav>
        <a href="homepage.php"><i class="fas fa-question-circle"></i> HOMEPAGE</a>
        <a href="#"><i class="fas fa-book"></i> CURSOS</a>
        <a href="#"><i class="fas fa-user"></i> PERFIL</a>
        <a href="logout.php"><i class="fas fa-sign-out-alt"></i> SAIR</a>
        <img src="https://i.imgur.com/W8yZNOX.png" alt="Avatar" class="avatar">
      </nav>
    </div>
  </header>

  <div class="main-container">
    <aside class="sidebar">
      <div class="sidebar-content">
        <h2 class="logo"><i class="fas fa-code"></i> Dev_lingo</h2>
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
               data-tempo-recarga="<?php echo $tempo_recarga; ?>">
            
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
          
          <div class="missao-card">
            <h3><i class="fas fa-calendar-day"></i> Missão Diária</h3>
            <p>Conclua uma lição</p>
            <div class="barra-progresso"><div class="barra-preenchida" style="width: 50%;"></div></div>
          </div>
          
          <div class="missao-card">
            <h3><i class="fas fa-calendar-week"></i> Missão Semanal</h3>
            <p>Complete uma trilha</p>
            <div class="barra-progresso"><div class="barra-preenchida" style="width: 10%;"></div></div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <script src="JS/trilhas.js"></script>
</body>
</html>