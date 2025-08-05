<?php
require_once 'includes/config.php';

// Proteção de página: verifica se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit();
}

$usuario_id = $_SESSION['usuario_id'];

// Lógica para adicionar curso
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['adicionar_curso'])) {
    $trilha_id = filter_input(INPUT_POST, 'trilha_id', FILTER_VALIDATE_INT);

    if ($trilha_id) {
        $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM usuario_trilhas WHERE usuario_id = ? AND trilha_id = ?");
        $stmt_check->execute([$usuario_id, $trilha_id]);
        
        if ($stmt_check->fetchColumn() == 0) {
            $stmt_insert = $pdo->prepare("INSERT INTO usuario_trilhas (usuario_id, trilha_id) VALUES (?, ?)");
            $stmt_insert->execute([$usuario_id, $trilha_id]);
            $_SESSION['mensagem_cursos'] = ['tipo' => 'sucesso', 'texto' => 'Curso adicionado à sua trilha!'];
        } else {
            $_SESSION['mensagem_cursos'] = ['tipo' => 'info', 'texto' => 'Este curso já está nas suas trilhas.'];
        }
    }
    header('Location: cursos.php');
    exit();
}

// Busca todos os cursos disponíveis
$stmt_cursos = $pdo->query("SELECT id, nome, icone, descricao FROM trilhas WHERE ativa = 1 ORDER BY ordem ASC");
$cursos_disponiveis = $stmt_cursos->fetchAll(PDO::FETCH_ASSOC);

// Busca os IDs dos cursos que o usuário já tem
$stmt_user_trilhas = $pdo->prepare("SELECT trilha_id FROM usuario_trilhas WHERE usuario_id = ?");
$stmt_user_trilhas->execute([$usuario_id]);
$cursos_do_usuario = $stmt_user_trilhas->fetchAll(PDO::FETCH_COLUMN);

// Mensagem de feedback (sucesso/erro)
$mensagem_feedback = isset($_SESSION['mensagem_cursos']) ? $_SESSION['mensagem_cursos'] : null;
unset($_SESSION['mensagem_cursos']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <?php include 'includes/head.php'; ?>
  <title>Devlingo - Cursos Disponíveis</title>
  <link rel="stylesheet" href="CSS/cursos.css">
</head>
<body>
  <?php include_once 'includes/header.php'; ?>

  <main class="container-principal">
    <h1 class="titulo-secao">Explore Nossos Cursos</h1>

    <?php if ($mensagem_feedback): ?>
      <div class="feedback <?= htmlspecialchars($mensagem_feedback['tipo']) ?>">
        <p><?= htmlspecialchars($mensagem_feedback['texto']) ?></p>
      </div>
    <?php endif; ?>

    <div class="grade-cursos">
      <?php foreach ($cursos_disponiveis as $curso):
          $ja_adicionado = in_array($curso['id'], $cursos_do_usuario);
      ?>
          <div class="cartao-curso">
              <i class="<?= htmlspecialchars($curso['icone']) ?> icone-curso"></i>
              <h3><?= htmlspecialchars($curso['nome']) ?></h3>
              <p><?= htmlspecialchars($curso['descricao']) ?></p>
              <form method="POST" action="cursos.php">
                  <input type="hidden" name="trilha_id" value="<?= $curso['id'] ?>">
                  <button type="submit" name="adicionar_curso" class="botao-adicionar <?= $ja_adicionado ? 'adicionado' : '' ?>" <?= $ja_adicionado ? 'disabled' : '' ?>>
                      <i class="fas <?= $ja_adicionado ? 'fa-check' : 'fa-plus' ?>"></i>
                      <?= $ja_adicionado ? 'Adicionado' : 'Adicionar à Trilha' ?>
                  </button>
              </form>
          </div>
      <?php endforeach; ?>
    </div>
  </main>

  <script src="JS/trilhas.js"></script>
</body>
</html>
