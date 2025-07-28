<?php
require_once 'includes/config.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit();
}

$usuario_id = $_SESSION['usuario_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['adicionar_curso'])) {
    $trilha_id = filter_input(INPUT_POST, 'trilha_id', FILTER_VALIDATE_INT);

    if ($trilha_id) {
        try {
            $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM usuario_trilhas WHERE usuario_id = ? AND trilha_id = ?");
            $stmt_check->execute([$usuario_id, $trilha_id]);
            $ja_adicionado = $stmt_check->fetchColumn();

            if ($ja_adicionado == 0) {
                $stmt_insert = $pdo->prepare("INSERT INTO usuario_trilhas (usuario_id, trilha_id, etapa_atual, concluida, progresso) VALUES (?, ?, 1, 0, 0)");
                if ($stmt_insert->execute([$usuario_id, $trilha_id])) {
                    $_SESSION['mensagem_cursos'] = ['tipo' => 'sucesso', 'texto' => 'Curso adicionado à sua trilha!'];
                } else {
                    $_SESSION['mensagem_cursos'] = ['tipo' => 'erro', 'texto' => 'Erro ao adicionar o curso.'];
                }
            } else {
                $_SESSION['mensagem_cursos'] = ['tipo' => 'erro', 'texto' => 'Este curso já está nas suas trilhas.'];
            }
        } catch (PDOException $e) {
            error_log("Erro ao adicionar curso: " . $e->getMessage());
            $_SESSION['mensagem_cursos'] = ['tipo' => 'erro', 'texto' => 'Ocorreu um erro no servidor.'];
        }
    } else {
        $_SESSION['mensagem_cursos'] = ['tipo' => 'erro', 'texto' => 'ID do curso inválido.'];
    }
    header('Location: cursos.php');
    exit();
}

$stmt_cursos = $pdo->query("SELECT id, nome, icone, descricao FROM trilhas ORDER BY ordem ASC");
$cursos_disponiveis = $stmt_cursos->fetchAll(PDO::FETCH_ASSOC);

$stmt_user_trilhas = $pdo->prepare("SELECT trilha_id FROM usuario_trilhas WHERE usuario_id = ?");
$stmt_user_trilhas->execute([$usuario_id]);
$cursos_do_usuario = $stmt_user_trilhas->fetchAll(PDO::FETCH_COLUMN, 0);

$stmt_user_avatar = $pdo->prepare("SELECT avatar FROM usuarios WHERE id = ?");
$stmt_user_avatar->execute([$usuario_id]);
$user_avatar_data = $stmt_user_avatar->fetch(PDO::FETCH_ASSOC);
$avatar_url = isset($user_avatar_data['avatar']) ? $user_avatar_data['avatar'] : 'https://i.imgur.com/W8yZNOX.png'; // Usando isset para compatibilidade

$mensagem_feedback = isset($_SESSION['mensagem_cursos']) ? $_SESSION['mensagem_cursos'] : null; // Usando isset para compatibilidade
unset($_SESSION['mensagem_cursos']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devlingo - Cursos Disponíveis</title>
  <link rel="stylesheet" href="CSS/cursos.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <?php include_once 'includes/header.php'; ?>

  <div class="main-content">
    <h1 class="section-title">Explore Nossos Cursos</h1>

    <?php if ($mensagem_feedback): ?>
      <div class="feedback <?= htmlspecialchars($mensagem_feedback['tipo']) ?>" style="display: block;">
        <i class="fas <?= htmlspecialchars($mensagem_feedback['tipo']) === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle' ?>"></i>
        <p><?= htmlspecialchars($mensagem_feedback['texto']) ?></p>
      </div>
    <?php endif; ?>

    <div class="cursos-grid">
      <?php if (!empty($cursos_disponiveis)): ?>
          <?php foreach ($cursos_disponiveis as $curso):
              $ja_adicionado = in_array($curso['id'], $cursos_do_usuario);
          ?>
              <div class="curso-card">
                  <i class="<?= htmlspecialchars($curso['icone']) ?> curso-icon"></i>
                  <h3><?= htmlspecialchars($curso['nome']) ?></h3>
                  <p><?= htmlspecialchars($curso['descricao']) ?></p>
                  <form method="POST" action="cursos.php">
                      <input type="hidden" name="trilha_id" value="<?= htmlspecialchars($curso['id']) ?>">
                      <button type="submit" name="adicionar_curso" class="btn-adicionar <?= $ja_adicionado ? 'adicionado' : '' ?>">
                          <i class="fas <?= $ja_adicionado ? 'fa-check' : 'fa-plus' ?>"></i>
                          <?= $ja_adicionado ? 'Adicionado' : 'Adicionar à Minha Trilha' ?>
                      </button>
                  </form>
              </div>
          <?php endforeach; ?>
      <?php else: ?>
          <p style="color: rgba(255, 255, 255, 0.7); text-align: center; grid-column: 1 / -1;">
              Nenhum curso disponível no momento. Volte mais tarde!
          </p>
      <?php endif; ?>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        mainContent.style.transition = 'all 0.5s ease-out';
        setTimeout(() => {
          mainContent.style.opacity = '1';
          mainContent.style.transform = 'translateY(0)';
        }, 100);
      }

      const feedbackElement = document.querySelector('.feedback');
      if (feedbackElement && feedbackElement.style.display === 'block') {
        feedbackElement.style.animation = 'slideDown 0.5s ease-out';
        setTimeout(() => {
          feedbackElement.style.animation = 'fadeOutUp 0.5s ease-in forwards';
          setTimeout(() => { feedbackElement.remove(); }, 500);
        }, 5000);
      }
    });
  </script>
</body>
</html>