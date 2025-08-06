<?php
// includes/header.php

// Lógica para verificar se há uma nova conquista na sessão
$nova_conquista = isset($_SESSION['nova_conquista']) ? $_SESSION['nova_conquista'] : null;
if ($nova_conquista) {
    unset($_SESSION['nova_conquista']); // Limpa para não mostrar de novo
}

// Lógica do avatar: se não estiver definida na página, busca no banco
if (!isset($avatar_url)) {
    if (isset($_SESSION['usuario_id']) && isset($pdo)) {
        $stmt_avatar = $pdo->prepare("SELECT avatar FROM usuarios WHERE id = ?");
        $stmt_avatar->execute([$_SESSION['usuario_id']]);
        $result = $stmt_avatar->fetch(PDO::FETCH_ASSOC);
        $avatar_url = isset($result['avatar']) ? $result['avatar'] : 'imagens/foto_perfil/buddhapato.png';
    } else {
        $avatar_url = 'imagens/foto_perfil/buddhapato.png'; // Padrão
    }
}
?>
<!-- O CSS do header foi movido para o arquivo CSS/estilo-global.css -->
<header>
    <div class="conteudo-cabecalho">
        <a href="homepage.php" class="logo">
            <i class="fas fa-code"></i>
            <span>Dev_lingo</span>
        </a>
        <nav>
            <a href="cursos.php"><i class="fas fa-book"></i> <span>CURSOS</span></a>
            <a href="trilhas.php"><i class="fas fa-rocket"></i> <span>TRILHAS</span></a>
            <a href="perfil.php"><i class="fas fa-user"></i> <span>PERFIL</span></a>
        </nav>
        <div class="acoes-usuario">
            <a href="perfil.php">
                <img src="<?= htmlspecialchars($avatar_url) ?>" alt="Avatar" class="avatar">
            </a>
            <a href="logout.php" class="link-logout">
                <i class="fas fa-sign-out-alt"></i> <span>SAIR</span>
            </a>
        </div>
    </div>
</header>
</script>
