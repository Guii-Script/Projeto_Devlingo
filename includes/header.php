<?php
// Lógica para verificar se há uma nova conquista na sessão
// Correção para compatibilidade com PHP < 7: substituindo '??' por 'isset()'
$nova_conquista = isset($_SESSION['nova_conquista']) ? $_SESSION['nova_conquista'] : null;
if ($nova_conquista) {
    unset($_SESSION['nova_conquista']); // Limpa para não mostrar de novo
}

// Lógica do avatar aprimorada: se não estiver definida, busca no banco
if (!isset($avatar_url)) {
    if (isset($_SESSION['usuario_id']) && isset($pdo)) {
        $stmt_avatar = $pdo->prepare("SELECT avatar FROM usuarios WHERE id = ?");
        $stmt_avatar->execute([$_SESSION['usuario_id']]);
        $result = $stmt_avatar->fetch(PDO::FETCH_ASSOC);
        // Correção para compatibilidade com PHP < 7
        $avatar_url = isset($result['avatar']) ? $result['avatar'] : 'https://i.imgur.com/W8yZNOX.png';
    } else {
        $avatar_url = 'https://i.imgur.com/W8yZNOX.png'; // Padrão
    }
}
?>
<style>
    :root {
        --cor-primaria: #2EF2AA;
        --cor-secundaria: #0f2b40;
        --cor-fundo: #01080D;
        --cor-texto: #ffffff;
        --cor-destaque: #25d895;
        --cor-card: #0a1620;
        --cor-borda: rgba(46, 242, 170, 0.2);
    }

    /* Reset e Estilos Globais */
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
    }

    body {
        color: var(--cor-texto);
        background-color: var(--cor-fundo);
        min-height: 100vh;
        overflow-x: hidden;
        line-height: 1.6;
        padding-top: 72px;
    }

    /* Header Profissional */
    header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 72px;
        z-index: 1000;
        background-color: rgba(10, 22, 32, 0.98);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        padding: 0 2rem;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid var(--cor-borda);
    }

    .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--cor-primaria);
        text-decoration: none;
        flex-shrink: 0;
    }

    .logo i {
        font-size: 1.8rem;
        color: var(--cor-primaria);
    }

    .header-content nav {
        display: flex;
        align-items: center;
        gap: 2rem;
        justify-content: center;
    }

    .user-actions {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-shrink: 0;
    }

    nav a {
        color: var(--cor-texto);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        position: relative;
        padding: 0.5rem 0;
    }

    nav a:hover {
        color: var(--cor-primaria);
    }

    nav a::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background-color: var(--cor-primaria);
        transition: width 0.3s ease;
    }

    nav a:hover::after {
        width: 100%;
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--cor-primaria);
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .avatar:hover {
        transform: scale(1.1);
        box-shadow: 0 0 15px var(--cor-primaria);
    }

    .logout-link {
        color: var(--cor-texto);
        text-decoration: none;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        font-size: 0.95rem;
        position: relative;
        padding: 0.5rem 0;
    }

    .logout-link:hover {
        color: #ff6b6b;
    }

    .logout-link::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background-color: #ff6b6b;
        transition: width 0.3s ease;
    }

    .logout-link:hover::after {
        width: 100%;
    }

    /* Responsividade do Header */
    @media (max-width: 768px) {
        header {
            padding: 0 1.5rem;
            height: auto;
        }
        .header-content {
            flex-direction: column;
            gap: 1rem;
            padding-bottom: 0.5rem;
        }
        .header-content nav {
            margin-left: 0;
            margin-right: 0;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.8rem;
            width: 100%;
        }
        nav a span {
            display: none;
        }
        .logo {
            font-size: 1.3rem;
            margin-right: 0;
            margin-bottom: 0.5rem;
        }
        .logo i {
            font-size: 1.5rem;
        }
        .user-actions {
            margin-left: 0;
            margin-top: 0.5rem;
            justify-content: center;
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        header {
            padding: 0.8rem 1rem;
        }
        .avatar {
            width: 35px;
            height: 35px;
        }
    }
</style>
<header>
    <div class="header-content">
        <a href="homepage.php" class="logo">
            <i class="fas fa-code"></i>
            <span>Dev_lingo</span>
        </a>
        <nav>
            <a href="cursos.php"><i class="fas fa-book"></i> <span>CURSOS</span></a>
            <a href="trilhas.php"><i class="fas fa-rocket"></i> <span>TRILHAS</span></a>
            <a href="perfil.php"><i class="fas fa-user"></i> <span>PERFIL</span></a>
        </nav>
        <div class="user-actions">
            <a href="perfil.php">
                <img src="<?= htmlspecialchars($avatar_url) ?>" alt="Avatar" class="avatar">
            </a>
            <a href="logout.php" class="logout-link">
                <i class="fas fa-sign-out-alt"></i> <span>SAIR</span>
            </a>
        </div>
    </div>
</header>

<!-- Container para a notificação de conquista (NOVO) -->
<div id="notificacao-container" class="notificacao-conquista-overlay"></div>

<!-- Script para exibir a notificação se houver uma (NOVO) -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    <?php if ($nova_conquista): ?>
        // A função mostrarNotificacaoConquista está em trilhas.js
        // É importante que trilhas.js seja carregado em todas as páginas para isso funcionar
        if (typeof mostrarNotificacaoConquista === 'function') {
            mostrarNotificacaoConquista(
                '<?= htmlspecialchars($nova_conquista['icone']) ?>',
                '<?= htmlspecialchars($nova_conquista['nome']) ?>',
                '<?= htmlspecialchars($nova_conquista['descricao']) ?>'
            );
        }
    <?php endif; ?>
});
</script>
