<?php
  // 1. CONFIGURAÇÃO E SEGURANÇA
  require_once 'includes/config.php';

  if (!isset($_SESSION['usuario_id'])) {
      header('Location: login.php');
      exit();
  }
  $usuario_id = $_SESSION['usuario_id'];

  // 2. LÓGICA PARA ATUALIZAR O NOME
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['salvar_perfil'])) {
      $novo_nome = trim($_POST['nome'] ?? '');

      if (!empty($novo_nome)) {
          $stmt_update = $pdo->prepare("UPDATE usuarios SET nome = ? WHERE id = ?");
          if ($stmt_update->execute([$novo_nome, $usuario_id])) {
              $_SESSION['sucesso_perfil'] = "Perfil atualizado com sucesso!";
          } else {
              $_SESSION['erro_perfil'] = "Erro ao atualizar o perfil.";
          }
      } else {
          $_SESSION['erro_perfil'] = "O nome não pode estar vazio.";
      }
      header('Location: perfil.php');
      exit();
  }

  // 3. BUSCAR DADOS DO USUÁRIO PARA EXIBIÇÃO
  $stmt = $pdo->prepare("SELECT id, nome, email, avatar, moedas, streak, vidas FROM usuarios WHERE id = ?");
  $stmt->execute([$usuario_id]);
  $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

  // Define valores padrão para evitar erros
  $nome_usuario_db = $usuario['nome'] ?? 'Usuário Devlingo';
  $avatar_url = $usuario['avatar'] ?? 'https://i.imgur.com/W8yZNOX.png';
  $moedas = $usuario['moedas'] ?? 0;
  $streak = $usuario['streak'] ?? 0;
  $vidas = $usuario['vidas'] ?? 3;

  // 4. BUSCAR ESTATÍSTICAS DINÂMICAS (CURSOS CONCLUÍDOS)
  $stmt_cursos = $pdo->prepare("SELECT COUNT(*) FROM usuario_trilhas WHERE usuario_id = ? AND concluida = 1");
  $stmt_cursos->execute([$usuario_id]);
  $cursos_concluidos = $stmt_cursos->fetchColumn();

  // 5. BUSCAR CONQUISTAS DO USUÁRIO
  $stmt_conquistas = $pdo->prepare("SELECT c.nome, c.descricao, c.icone FROM usuario_conquistas uc JOIN conquistas c ON uc.conquista_id = c.id WHERE uc.usuario_id = ? ORDER BY uc.data_conquista DESC");
  $stmt_conquistas->execute([$usuario_id]);
  $conquistas_usuario = $stmt_conquistas->fetchAll(PDO::FETCH_ASSOC);

  // 6. PREPARAR MENSAGENS DE FEEDBACK
  $mensagem_sucesso = $_SESSION['sucesso_perfil'] ?? '';
  $mensagem_erro = $_SESSION['erro_perfil'] ?? '';
  unset($_SESSION['sucesso_perfil'], $_SESSION['erro_perfil']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devlingo - Meu Perfil</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="CSS/perfil.css">
</head>
<body>
  
  <?php include_once 'includes/header.php'; ?>

  <div class="container-perfil">
    <div class="menu-perfil">
      <img src="<?= htmlspecialchars($avatar_url) ?>" alt="Avatar do Usuário">
      <h2><?= htmlspecialchars($nome_usuario_db) ?></h2>

      <form method="POST" action="perfil.php">
        <div class="grupo-formulario">
          <label for="nome">Nome de Usuário <span class="etiqueta-editor">Editor</span></label>
          <input type="text" id="nome" name="nome" value="<?= htmlspecialchars($nome_usuario_db) ?>">
        </div>
        <button type="submit" name="salvar_perfil" class="botao-salvar">SALVAR <i class="fas fa-check"></i></button>
      </form>

      <a href="#" class="deletar-conta">
        Deletar minha conta
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M3 6l3 18h12l3-18H3zm18-4H3v2h18V2z"/></svg>
      </a>
    </div>

    <div class="conteudo-perfil">
      <h1>Estatísticas</h1>
      <div class="grid-dados">
        <div class="data-card">
          <i class="fas fa-heart"></i>
          <div class="valor"><?= htmlspecialchars($vidas) ?></div>
          <div class="rotulo">Vidas</div>
        </div>
        <div class="data-card">
          <i class="fas fa-fire"></i>
          <div class="valor"><?= htmlspecialchars($streak) ?></div>
          <div class="rotulo">Sequência</div>
        </div>
        <div class="data-card">
          <i class="fas fa-gem"></i>
          <div class="valor"><?= htmlspecialchars($moedas) ?></div>
          <div class="rotulo">Gemas</div>
        </div>
        <div class="data-card">
          <i class="fas fa-book-open"></i>
          <div class="valor"><?= htmlspecialchars($cursos_concluidos) ?></div>
          <div class="rotulo">Cursos Concluídos</div>
        </div>
      </div>

      <h3 class="section-titulo">Suas Conquistas</h3>
      <div class="conquistas-grid">
        <?php if (!empty($conquistas_usuario)): ?>
            <?php foreach ($conquistas_usuario as $conquista): ?>
                <div class="conquista-card">
                    <i class="<?= htmlspecialchars($conquista['icone']) ?> icon-conquista"></i>
                    <h4><?= htmlspecialchars($conquista['nome']) ?></h4>
                    <p><?= htmlspecialchars($conquista['descricao']) ?></p>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="sem-conquistas">
                Você ainda não desbloqueou nenhuma conquista. Continue aprendendo!
            </p>
        <?php endif; ?>
      </div>
    </div>
  </div>

  <script src="JS/trilhas.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      <?php if ($mensagem_sucesso): ?>
        mostrarFeedback(<?= json_encode($mensagem_sucesso) ?>, true);
      <?php endif; ?>
      <?php if ($mensagem_erro): ?>
        mostrarFeedback(<?= json_encode($mensagem_erro) ?>, false);
      <?php endif; ?>
    });
  </script>
</body>
</html>
