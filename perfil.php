<?php
  require_once 'includes/config.php';

  if (!isset($_SESSION['usuario_id'])) {
      header('Location: login.php');
      exit();
  }
  $usuario_id = $_SESSION['usuario_id'];

  $avatares_permitidos = [
      'imagens/foto_perfil/buddhapato.png', 'imagens/foto_perfil/venompato.png',
      'imagens/foto_perfil/counterpato.png', 'imagens/foto_perfil/patofeliz.png',
      'imagens/foto_perfil/royalepato.png', 'https://i.imgur.com/y1g2f6b.png',
  ];

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      if (isset($_POST['salvar_perfil'])) {
          $novo_nome = trim(isset($_POST['nome']) ? $_POST['nome'] : '');
          $novo_avatar = isset($_POST['avatar']) ? $_POST['avatar'] : '';

          if (!empty($novo_nome)) {
              $pdo->prepare("UPDATE usuarios SET nome = ? WHERE id = ?")->execute([$novo_nome, $usuario_id]);
          }
          if (!empty($novo_avatar) && in_array($novo_avatar, $avatares_permitidos)) {
              $pdo->prepare("UPDATE usuarios SET avatar = ? WHERE id = ?")->execute([$novo_avatar, $usuario_id]);
          }
          $_SESSION['sucesso_perfil'] = "Perfil atualizado com sucesso!";
          header('Location: perfil.php');
          exit();
      }

      if (isset($_POST['deletar_conta_confirmado'])) {
          $pdo->prepare("DELETE FROM usuarios WHERE id = ?")->execute([$usuario_id]);
          session_unset();
          session_destroy();
          header('Location: login.php?status=deletado');
          exit();
      }
  }

  $usuario_stmt = $pdo->prepare("SELECT nome, avatar, moedas, streak, vidas FROM usuarios WHERE id = ?");
  $usuario_stmt->execute([$usuario_id]);
  $usuario_data = $usuario_stmt->fetch(PDO::FETCH_ASSOC);

  $nome_usuario_db = isset($usuario_data['nome']) ? $usuario_data['nome'] : 'Usuário Devlingo';
  $avatar_url = isset($usuario_data['avatar']) ? $usuario_data['avatar'] : $avatares_permitidos[0];
  $moedas = isset($usuario_data['moedas']) ? $usuario_data['moedas'] : 0;
  $streak = isset($usuario_data['streak']) ? $usuario_data['streak'] : 0;
  $vidas = isset($usuario_data['vidas']) ? $usuario_data['vidas'] : 3;

  $cursos_stmt = $pdo->prepare("SELECT COUNT(*) FROM usuario_trilhas WHERE usuario_id = ? AND concluida = 1");
  $cursos_stmt->execute([$usuario_id]);
  $cursos_concluidos_total = $cursos_stmt->fetchColumn();

  $user_conquistas_stmt = $pdo->prepare("SELECT c.id, c.nome, c.descricao, c.icone FROM usuario_conquistas uc JOIN conquistas c ON uc.conquista_id = c.id WHERE uc.usuario_id = ? ORDER BY c.id ASC");
  $user_conquistas_stmt->execute([$usuario_id]);
  $conquistas_desbloqueadas = $user_conquistas_stmt->fetchAll(PDO::FETCH_ASSOC);

  $mensagem_sucesso = isset($_SESSION['sucesso_perfil']) ? $_SESSION['sucesso_perfil'] : '';
  $mensagem_erro = isset($_SESSION['erro_perfil']) ? $_SESSION['erro_perfil'] : '';
  unset($_SESSION['sucesso_perfil'], $_SESSION['erro_perfil']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <?php include 'includes/head.php'; ?>
  <title>Devlingo - Meu Perfil</title>
  <link rel="stylesheet" href="CSS/perfil.css">
</head>
<body>
  
  <?php include_once 'includes/header.php'; ?>

  <div class="container-perfil">
    <div class="menu-perfil">
      <div class="container-avatar">
        <img src="<?= htmlspecialchars($avatar_url) ?>" alt="Avatar do Usuário" id="avatar-principal">
        <button class="botao-editar-avatar" id="abrir-modal-avatar" title="Editar Avatar">
          <i class="fas fa-camera"></i>
        </button>
      </div>
      <h2><?= htmlspecialchars($nome_usuario_db) ?></h2>

      <form method="POST" action="perfil.php" id="form-perfil">
        <div class="grupo-formulario">
          <label for="nome">Nome de Usuário</label>
          <input type="text" id="nome" name="nome" value="<?= htmlspecialchars($nome_usuario_db) ?>">
        </div>
        <input type="hidden" name="avatar" id="input-avatar-selecionado" value="<?= htmlspecialchars($avatar_url) ?>">
        <button type="submit" name="salvar_perfil" class="botao-salvar">SALVAR ALTERAÇÕES</button>
      </form>

      <button class="botao-deletar-conta" id="abrir-modal-delecao">
        <i class="fas fa-trash-alt"></i> Deletar minha conta
      </button>
    </div>

    <div class="conteudo-perfil">
      <h1>Estatísticas</h1>
      <div class="grade-estatisticas">
        <div class="cartao-estatistica"><i class="fas fa-heart"></i><div class="valor"><?= htmlspecialchars($vidas) ?></div><div class="rotulo">Vidas</div></div>
        <div class="cartao-estatistica"><i class="fas fa-fire"></i><div class="valor"><?= htmlspecialchars($streak) ?></div><div class="rotulo">Sequência</div></div>
        <div class="cartao-estatistica"><i class="fas fa-gem"></i><div class="valor"><?= htmlspecialchars($moedas) ?></div><div class="rotulo">Gemas</div></div>
        <div class="cartao-estatistica"><i class="fas fa-book-open"></i><div class="valor"><?= htmlspecialchars($cursos_concluidos_total) ?></div><div class="rotulo">Cursos Concluídos</div></div>
      </div>

      <h3 class="titulo-secao">Emblemas de Conquista</h3>
      <div class="grade-conquistas">
        <?php if (!empty($conquistas_desbloqueadas)): ?>
            <?php foreach ($conquistas_desbloqueadas as $conquista): ?>
                <div class="emblema-conquista">
                    <img src="<?= htmlspecialchars($conquista['icone']) ?>" alt="<?= htmlspecialchars($conquista['nome']) ?>">
                    <div class="tooltip-conquista">
                        <h4><?= htmlspecialchars($conquista['nome']) ?></h4>
                        <p><?= htmlspecialchars($conquista['descricao']) ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="sem-conquistas">Você ainda não desbloqueou nenhuma conquista.</p>
        <?php endif; ?>
      </div>
    </div>
  </div>

  <!-- MODAIS -->
  <div id="modal-avatar" class="modal-overlay escondido">
    <div class="modal-conteudo">
      <button class="modal-fechar" id="fechar-modal-avatar">&times;</button>
      <h2>Escolha seu novo avatar</h2>
      <div class="grade-avatar">
        <?php foreach ($avatares_permitidos as $item_avatar): ?>
          <img src="<?= htmlspecialchars($item_avatar) ?>" class="opcao-avatar <?= ($item_avatar === $avatar_url) ? 'selecionado' : '' ?>" data-url="<?= htmlspecialchars($item_avatar) ?>">
        <?php endforeach; ?>
      </div>
      <button id="confirmar-avatar" class="botao-salvar">Confirmar</button>
    </div>
  </div>

  <div id="modal-delecao" class="modal-overlay escondido">
    <div class="modal-conteudo">
      <button class="modal-fechar" id="fechar-modal-delecao">&times;</button>
      <h2>Deletar Conta</h2>
      <p>Você tem certeza? Esta ação é irreversível e todo o seu progresso será perdido.</p>
      <div class="modal-botoes">
        <button id="cancelar-delecao" class="botao-cancelar">Cancelar</button>
        <form method="POST" action="perfil.php" style="display: inline;">
          <button type="submit" name="deletar_conta_confirmado" class="botao-confirmar-delecao">Sim, deletar</button>
        </form>
      </div>
    </div>
  </div>

  <script src="JS/trilhas.js"></script>
  <script>
    // SCRIPT CORRIGIDO E RESTAURADO PARA A PÁGINA DE PERFIL
    document.addEventListener('DOMContentLoaded', function() {
      const modalAvatar = document.getElementById('modal-avatar');
      const modalDelecao = document.getElementById('modal-delecao');

      const abrirModal = (modal) => modal.classList.remove('escondido');
      const fecharModal = (modal) => modal.classList.add('escondido');

      document.getElementById('abrir-modal-avatar').addEventListener('click', () => abrirModal(modalAvatar));
      document.getElementById('fechar-modal-avatar').addEventListener('click', () => fecharModal(modalAvatar));
      document.getElementById('confirmar-avatar').addEventListener('click', () => fecharModal(modalAvatar));
      
      document.getElementById('abrir-modal-delecao').addEventListener('click', () => abrirModal(modalDelecao));
      document.getElementById('fechar-modal-delecao').addEventListener('click', () => fecharModal(modalDelecao));
      document.getElementById('cancelar-delecao').addEventListener('click', () => fecharModal(modalDelecao));

      window.addEventListener('click', (e) => {
        if (e.target === modalAvatar) fecharModal(modalAvatar);
        if (e.target === modalDelecao) fecharModal(modalDelecao);
      });

      const gradeAvatar = document.querySelector('.grade-avatar');
      const avatarPrincipalImg = document.getElementById('avatar-principal');
      const avatarInput = document.getElementById('input-avatar-selecionado');

      gradeAvatar.addEventListener('click', function(e) {
        if (e.target.classList.contains('opcao-avatar')) {
          gradeAvatar.querySelectorAll('.opcao-avatar').forEach(img => img.classList.remove('selecionado'));
          const selecionado = e.target;
          selecionado.classList.add('selecionado');
          avatarInput.value = selecionado.dataset.url;
          avatarPrincipalImg.src = selecionado.dataset.url;
        }
      });

      // A função mostrarFeedback() vem do trilhas.js
      <?php if ($mensagem_sucesso): ?>
        if(typeof mostrarFeedback === 'function') mostrarFeedback('<?= addslashes($mensagem_sucesso) ?>', 'sucesso');
      <?php endif; ?>
      <?php if ($mensagem_erro): ?>
        if(typeof mostrarFeedback === 'function') mostrarFeedback('<?= addslashes($mensagem_erro) ?>', 'erro');
      <?php endif; ?>
    });
  </script>
</body>
</html>
