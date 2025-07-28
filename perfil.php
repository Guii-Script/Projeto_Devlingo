<?php
  // Inclui a configuração centralizada (inicia a sessão e conecta ao banco)
  require_once 'includes/config.php';

  // Verifica se o usuário está logado, senão, redireciona
  if (!isset($_SESSION['usuario_id'])) {
      header('Location: login.php');
      exit();
  }

  // Busca os dados do usuário logado usando as COLUNAS CORRETAS do seu SQL
  $stmt = $pdo->prepare("SELECT id, nome, email, avatar, moedas, streak, vidas, tempo_recarga FROM usuarios WHERE id = ?");
  $stmt->execute([$_SESSION['usuario_id']]);
  $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

  // Define valores padrão caso não encontre o usuário ou dados
  $nome_usuario_db = isset($usuario['nome']) ? $usuario['nome'] : 'Usuário Devlingo';
  $avatar_url = isset($usuario['avatar']) ? $usuario['avatar'] : 'https://i.imgur.com/W8yZNOX.png';
  $moedas = isset($usuario['moedas']) ? $usuario['moedas'] : 0;
  $streak = isset($usuario['streak']) ? $usuario['streak'] : 0;
  $vidas = isset($usuario['vidas']) ? $usuario['vidas'] : 3;
  $tempo_recarga = isset($usuario['tempo_recarga']) ? $usuario['tempo_recarga'] : null;


  // Lógica para processar o formulário de atualização (APENAS NOME)
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['salvar_perfil'])) {
      $novo_nome = isset($_POST['nome']) ? $_POST['nome'] : $nome_usuario_db;


      // Validação básica
      $erros_update = [];
      if (empty($novo_nome)) {
          $erros_update[] = "O nome não pode estar vazio.";
      }

      if (empty($erros_update)) {
          $stmt_update = $pdo->prepare("UPDATE usuarios SET nome = ? WHERE id = ?");
          if ($stmt_update->execute([$novo_nome, $_SESSION['usuario_id']])) {
              // Recarrega os dados do usuário após o update para refletir as mudanças
              $stmt = $pdo->prepare("SELECT id, nome, email, avatar, moedas, streak, vidas, tempo_recarga FROM usuarios WHERE id = ?");
              $stmt->execute([$_SESSION['usuario_id']]);
              $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
              $nome_usuario_db = $usuario['nome'];

              $_SESSION['sucesso_perfil'] = "Perfil atualizado com sucesso!";
              header('Location: perfil.php');
              exit();
          } else {
              $_SESSION['erro_perfil'] = "Erro ao atualizar o perfil. Tente novamente.";
              header('Location: perfil.php');
              exit();
          }
      } else {
          $_SESSION['erro_perfil'] = implode("<br>", $erros_update);
          header('Location: perfil.php');
          exit();
      }
  }

  // --- Lógica para buscar as conquistas do usuário ---
  $conquistas_usuario = [];
  try {
      $stmt_conquistas = $pdo->prepare("
          SELECT c.nome, c.descricao, c.icone
          FROM usuario_conquistas uc
          JOIN conquistas c ON uc.conquista_id = c.id
          WHERE uc.usuario_id = ?
          ORDER BY uc.data_conquista DESC
      ");
      $stmt_conquistas->execute([$_SESSION['usuario_id']]);
      $conquistas_usuario = $stmt_conquistas->fetchAll(PDO::FETCH_ASSOC);
  } catch (PDOException $e) {
      error_log("Erro ao buscar conquistas do usuário: " . $e->getMessage());
      $conquistas_usuario = [];
  }

  // Exibe mensagens de feedback (sucesso/erro)
  $mensagem_sucesso = isset($_SESSION['sucesso_perfil']) ? $_SESSION['sucesso_perfil'] : '';
  $mensagem_erro = isset($_SESSION['erro_perfil']) ? $_SESSION['erro_perfil'] : '';
  unset($_SESSION['sucesso_perfil']);
  unset($_SESSION['erro_perfil']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devlingo - Meu Perfil</title>
  <link rel="stylesheet" href="CSS/perfil.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <?php include_once 'includes/header.php'; ?>

  <div class="container-perfil">
    <div class="menu-perfil">
      <img src="<?= htmlspecialchars($avatar_url) ?>" alt="Avatar do Usuário">
      <h2><?= htmlspecialchars($nome_usuario_db) ?></h2>

      <?php if ($mensagem_sucesso): ?>
        <p class="feedback sucesso" style="color: var(--cor-primaria); text-align: center; margin-top: 1rem; font-weight: 600;"><?= $mensagem_sucesso ?></p>
      <?php endif; ?>
      <?php if ($mensagem_erro): ?>
        <p class="feedback erro" style="color: #f22e2e; text-align: center; margin-top: 1rem; font-weight: 600;"><?= $mensagem_erro ?></p>
      <?php endif; ?>

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
      <h1>Estatísticas do Perfil</h1>
      <h3 class="section-titulo">Progresso Geral</h3>
      <div class="grid-dados">
        <div class="data-card">
          <i class="fas fa-heart"></i>
          <div class="valor" id="vidas_display"><?= htmlspecialchars($vidas) ?></div>
          <div class="rotulo">Vidas</div>
        </div>
        <div class="data-card">
          <i class="fas fa-fire"></i>
          <div class="valor" id="streak_display"><?= htmlspecialchars($streak) ?></div>
          <div class="rotulo">Sequência</div>
        </div>
        <div class="data-card">
          <i class="fas fa-gem"></i>
          <div class="valor" id="moedas_display"><?= htmlspecialchars($moedas) ?></div>
          <div class="rotulo">Gemas</div>
        </div>
        <div class="data-card">
          <i class="fas fa-book-open"></i>
          <div class="valor">12</div>
          <div class="rotulo">Cursos Concluídos</div>
        </div>
        <div class="data-card">
          <i class="fas fa-tasks"></i>
          <div class="valor">85</div>
          <div class="rotulo">Missões Feitas</div>
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
            <p style="color: rgba(255, 255, 255, 0.7); text-align: center; grid-column: 1 / -1;">
                Você ainda não desbloqueou nenhuma conquista. Continue aprendendo!
            </p>
        <?php endif; ?>
      </div>

      <h3 class="section-titulo">Histórico de Atividade</h3>
      <div class="historico-atividade">
        <p>
            Você completou a etapa "Variáveis e Tipos de Dados" na trilha de Lógica de Programação. (+20 Gemas)
        </p>
        <p>
            Iniciou a trilha "Introdução ao JavaScript".
        </p>
        <p>
            Sua sequência atual é de <strong><?= htmlspecialchars($streak) ?> dias!</strong> Continue assim!
        </p>
      </div>
    </div>
  </div>

  <script>
    // Animação de entrada para o container principal
    document.addEventListener('DOMContentLoaded', function() {
      const containerPerfil = document.querySelector('.container-perfil');
      if (containerPerfil) {
        // As animações já estão aplicadas via CSS (animation: fadeIn...),
        // mas podemos adicionar um atraso para uma sensação de "build-up" se desejado.
        // Por exemplo, elementos dentro dos cards podem ter animation-delay.
        // O fadeIn no .container-perfil já cuida da entrada geral.
      }

      // Feedback de mensagens (sucesso/erro) - similar ao login/trilhas
      const feedbackSucesso = document.querySelector('.feedback.sucesso');
      const feedbackErro = document.querySelector('.feedback.erro');

      if (feedbackSucesso) {
          feedbackSucesso.style.display = 'block';
          feedbackSucesso.style.animation = 'slideDown 0.5s ease-out';
          setTimeout(() => {
              feedbackSucesso.style.animation = 'fadeOutUp 0.5s ease-in forwards'; // Assumindo que você tem fadeOutUp
              setTimeout(() => { feedbackSucesso.remove(); }, 500);
          }, 5000); // 5 segundos
      }
      if (feedbackErro) {
          feedbackErro.style.display = 'block';
          feedbackErro.style.animation = 'slideDown 0.5s ease-out';
          setTimeout(() => {
              feedbackErro.style.animation = 'fadeOutUp 0.5s ease-in forwards';
              setTimeout(() => { feedbackErro.remove(); }, 500);
          }, 5000); // 5 segundos
      }
    });
  </script>
</body>
</html>