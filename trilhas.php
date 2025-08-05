<?php
  require_once 'includes/config.php';

  if (!isset($_SESSION['usuario_id'])) {
      header('Location: login.php');
      exit();
  }

  $usuario_id = $_SESSION['usuario_id'];

  $stmt = $pdo->prepare("SELECT vidas, streak, moedas, tempo_recarga, avatar FROM usuarios WHERE id = ?");
  $stmt->execute([$usuario_id]);
  $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

  // Fallback para garantir que as variáveis sempre existam
  $vidas = isset($usuario['vidas']) ? $usuario['vidas'] : 3;
  $streak = isset($usuario['streak']) ? $usuario['streak'] : 0;
  $moedas = isset($usuario['moedas']) ? $usuario['moedas'] : 0;
  $tempo_recarga = isset($usuario['tempo_recarga']) ? $usuario['tempo_recarga'] : null;
  $avatar_url = isset($usuario['avatar']) ? $usuario['avatar'] : 'imagens/foto_perfil/buddhapato.png';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <?php include 'includes/head.php'; ?>
  <title>Devlingo - Trilhas</title>
  <link rel="stylesheet" href="CSS/trilhas.css">
</head>
<body>

  <div id="overlay-game-over" class="overlay-game-over escondido">
      <div class="caixa-game-over">
          <h1 class="texto-game-over">GAME OVER</h1>
          <p>Suas vidas recarregarão em:</p>
          <div id="timer-game-over" class="timer-game-over">05:00</div>
      </div>
  </div>

  <?php include_once 'includes/header.php'; ?>

  <div class="container-principal">
    <aside class="barra-lateral">
        <div id="lista-trilhas" class="menu-trilhas">
            <!-- As trilhas do usuário serão carregadas aqui pelo JS -->
        </div>
    </aside>

    <main class="conteudo">
      <section id="conteudo-trilha" class="conteudo-trilha">
        <!-- O conteúdo da trilha/pergunta será carregado aqui pelo JS -->
      </section>

      <aside class="missoes">
        <div class="container-status">
          <div class="status-jogador"
               data-vidas="<?= $vidas; ?>"
               data-streak="<?= $streak; ?>"
               data-moedas="<?= $moedas; ?>"
               data-tempo-recarga="<?= htmlspecialchars($tempo_recarga); ?>">

            <div class="item-status">
              <span class="icone"><i class="fas fa-heart"></i></span>
              <span id="vidas"><?= $vidas; ?></span>
            </div>
            <div class="item-status">
              <span class="icone"><i class="fas fa-fire"></i></span>
              <span id="streak"><?= $streak; ?></span>
            </div>
            <div class="item-status">
              <span class="icone"><i class="fas fa-gem"></i></span>
              <span id="moedas"><?= $moedas; ?></span>
            </div>
          </div>

          <div id="container-missoes-diarias">
            <!-- As missões serão carregadas aqui pelo JS -->
          </div>
        </div>
      </aside>
    </main>
  </div>

  <script src="JS/trilhas.js"></script>
</body>
</html>
