<?php
  // 1. CONFIGURAÇÃO E SEGURANÇA
  require_once 'includes/config.php';

  if (!isset($_SESSION['usuario_id'])) {
      header('Location: login.php');
      exit();
  }
  $usuario_id = $_SESSION['usuario_id'];

  // Array de avatares pré-definidos
  $avatares_permitidos = [
      'imagens/foto_perfil/buddhapato.png', 'imagens/foto_perfil/venompato.png',
      'imagens/foto_perfil/counterpato.png', 'imagens/foto_perfil/patofeliz.png',
      'imagens/foto_perfil/royalepato.png', 'https://i.imgur.com/y1g2f6b.png',
  ];

  // 2. PROCESSAMENTO DE FORMULÁRIOS (POST)
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      // --- ATUALIZAR NOME E AVATAR ---
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

      // --- DELETAR CONTA ---
      if (isset($_POST['deletar_conta_confirmado'])) {
          try {
              $pdo->prepare("DELETE FROM usuarios WHERE id = ?")->execute([$usuario_id]);
              session_unset();
              session_destroy();
              header('Location: login.php?status=deletado');
              exit();
          } catch (Exception $e) {
              $_SESSION['erro_perfil'] = "Erro ao deletar a conta.";
              header('Location: perfil.php');
              exit();
          }
      }
  }

  // 3. BUSCAR DADOS DO USUÁRIO
  $usuario_stmt = $pdo->prepare("SELECT nome, avatar, moedas, streak, vidas FROM usuarios WHERE id = ?");
  $usuario_stmt->execute([$usuario_id]);
  $usuario_data = $usuario_stmt->fetch(PDO::FETCH_ASSOC);

  // Fallback values
  $nome_usuario_db = isset($usuario_data['nome']) ? $usuario_data['nome'] : 'Usuário Devlingo';
  $avatar_url = isset($usuario_data['avatar']) ? $usuario_data['avatar'] : $avatares_permitidos[0];
  $moedas = isset($usuario_data['moedas']) ? $usuario_data['moedas'] : 0;
  $streak = isset($usuario_data['streak']) ? $usuario_data['streak'] : 0;
  $vidas = isset($usuario_data['vidas']) ? $usuario_data['vidas'] : 3;

  // 4. BUSCAR ESTATÍSTICAS (CURSOS E CONQUISTAS)
  $cursos_stmt = $pdo->prepare("SELECT COUNT(*) FROM usuario_trilhas WHERE usuario_id = ? AND concluida = 1");
  $cursos_stmt->execute([$usuario_id]);
  $cursos_concluidos_total = $cursos_stmt->fetchColumn();

  // LÓGICA DE CONQUISTAS ATUALIZADA: Busca apenas as conquistas desbloqueadas
  $user_conquistas_stmt = $pdo->prepare("
      SELECT c.id, c.nome, c.descricao, c.icone 
      FROM usuario_conquistas uc
      JOIN conquistas c ON uc.conquista_id = c.id
      WHERE uc.usuario_id = ?
      ORDER BY c.id ASC
  ");
  $user_conquistas_stmt->execute([$usuario_id]);
  $conquistas_desbloqueadas = $user_conquistas_stmt->fetchAll(PDO::FETCH_ASSOC);


  // 5. MENSAGENS DE FEEDBACK
  $mensagem_sucesso = isset($_SESSION['sucesso_perfil']) ? $_SESSION['sucesso_perfil'] : '';
  $mensagem_erro = isset($_SESSION['erro_perfil']) ? $_SESSION['erro_perfil'] : '';
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
      <div class="avatar-container">
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
        <input type="hidden" name="avatar" id="avatar-selecionado-input" value="<?= htmlspecialchars($avatar_url) ?>">
        <button type="submit" name="salvar_perfil" class="botao-salvar">SALVAR ALTERAÇÕES</button>
      </form>

      <button class="deletar-conta" id="abrir-modal-delecao">
        <i class="fas fa-trash-alt"></i> Deletar minha conta
      </button>
    </div>

    <div class="conteudo-perfil">
      <h1>Estatísticas</h1>
      <div class="grid-dados">
        <div class="data-card"><i class="fas fa-heart"></i><div class="valor"><?= htmlspecialchars($vidas) ?></div><div class="rotulo">Vidas</div></div>
        <div class="data-card"><i class="fas fa-fire"></i><div class="valor"><?= htmlspecialchars($streak) ?></div><div class="rotulo">Sequência</div></div>
        <div class="data-card"><i class="fas fa-gem"></i><div class="valor"><?= htmlspecialchars($moedas) ?></div><div class="rotulo">Gemas</div></div>
        <div class="data-card"><i class="fas fa-book-open"></i><div class="valor"><?= htmlspecialchars($cursos_concluidos_total) ?></div><div class="rotulo">Cursos Concluídos</div></div>
      </div>

      <h3 class="section-titulo">Emblemas de Conquista</h3>
      <div class="conquistas-grid">
        <?php if (!empty($conquistas_desbloqueadas)): ?>
            <?php foreach ($conquistas_desbloqueadas as $conquista): ?>
                <div class="emblema-conquista desbloqueada">
                    <img src="<?= htmlspecialchars($conquista['icone']) ?>" alt="<?= htmlspecialchars($conquista['nome']) ?>">
                    <div class="tooltip-conquista">
                        <h4><?= htmlspecialchars($conquista['nome']) ?></h4>
                        <p><?= htmlspecialchars($conquista['descricao']) ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="sem-conquistas">Você ainda não desbloqueou nenhuma conquista. Continue aprendendo!</p>
        <?php endif; ?>
      </div>
    </div>
  </div>

  <!-- MODAIS -->
  <div id="modal-avatar" class="modal-overlay hidden">
    <div class="modal-content">
      <button class="modal-fechar" id="fechar-modal-avatar">&times;</button>
      <h2>Escolha seu novo avatar</h2>
      <div class="avatar-grid">
        <?php foreach ($avatares_permitidos as $avatar_item): ?>
          <img src="<?= htmlspecialchars($avatar_item) ?>" class="avatar-opcao <?= ($avatar_item === $avatar_url) ? 'selecionado' : '' ?>" data-url="<?= htmlspecialchars($avatar_item) ?>">
        <?php endforeach; ?>
      </div>
      <button id="confirmar-avatar" class="botao-salvar">Confirmar</button>
    </div>
  </div>

  <div id="modal-delecao" class="modal-overlay hidden">
    <div class="modal-content">
      <button class="modal-fechar" id="fechar-modal-delecao">&times;</button>
      <h2>Deletar Conta</h2>
      <p>Você tem certeza? Esta ação é irreversível e todo o seu progresso será perdido para sempre.</p>
      <div class="modal-botoes">
        <button id="cancelar-delecao" class="botao-cancelar">Cancelar</button>
        <form method="POST" action="perfil.php" style="display: inline;">
          <button type="submit" name="deletar_conta_confirmado" class="botao-confirmar-delecao">Sim, deletar minha conta</button>
        </form>
      </div>
    </div>
  </div>

  <script src="JS/trilhas.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const modalAvatar = document.getElementById('modal-avatar');
      const modalDelecao = document.getElementById('modal-delecao');
      const abrirModal = (modal) => modal.classList.remove('hidden');
      const fecharModal = (modal) => modal.classList.add('hidden');

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

      const avatarGrid = document.querySelector('.avatar-grid');
      const avatarPrincipalImg = document.getElementById('avatar-principal');
      const avatarInput = document.getElementById('avatar-selecionado-input');

      avatarGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('avatar-opcao')) {
          avatarGrid.querySelectorAll('.avatar-opcao').forEach(img => img.classList.remove('selecionado'));
          const selecionado = e.target;
          selecionado.classList.add('selecionado');
          avatarInput.value = selecionado.dataset.url;
          avatarPrincipalImg.src = selecionado.dataset.url;
        }
      });

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
