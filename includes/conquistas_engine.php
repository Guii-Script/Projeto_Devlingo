<?php
// includes/conquistas_engine.php

/**
 * Verifica se um usuário já possui uma conquista e, caso não, a concede.
 * Se uma nova conquista for concedida, armazena seus detalhes na sessão para notificação.
 *
 * @param int $conquista_id O ID da conquista a ser verificada/concedida.
 * @param int $usuario_id O ID do usuário.
 * @param PDO $pdo A instância de conexão com o banco de dados.
 */
function verificar_e_conceder_conquista($conquista_id, $usuario_id, $pdo) {
    // 1. Verifica se o usuário já tem esta conquista
    $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM usuario_conquistas WHERE usuario_id = ? AND conquista_id = ?");
    $stmt_check->execute([$usuario_id, $conquista_id]);
    if ($stmt_check->fetchColumn() > 0) {
        return; // Usuário já tem, não faz nada
    }

    // 2. Concede a conquista
    $stmt_grant = $pdo->prepare("INSERT INTO usuario_conquistas (usuario_id, conquista_id, data_conquista) VALUES (?, ?, NOW())");
    $stmt_grant->execute([$usuario_id, $conquista_id]);

    // 3. Busca os detalhes da conquista para a notificação
    $stmt_details = $pdo->prepare("SELECT nome, descricao, icone FROM conquistas WHERE id = ?");
    $stmt_details->execute([$conquista_id]);
    $conquista_info = $stmt_details->fetch(PDO::FETCH_ASSOC);

    // 4. Armazena na sessão para notificar o usuário na próxima página
    if ($conquista_info) {
        $_SESSION['nova_conquista'] = $conquista_info;
    }

    // 5. Verifica a conquista "Buddhau" (Platinar)
    verificar_conquista_buddhau($usuario_id, $pdo);
}

/**
 * Função específica para verificar se o usuário ganhou a conquista "Buddhau".
 */
function verificar_conquista_buddhau($usuario_id, $pdo) {
    // Conta o total de conquistas no jogo (exceto a própria "Buddhau")
    $total_conquistas_stmt = $pdo->query("SELECT COUNT(*) FROM conquistas WHERE id != 6");
    $total_conquistas = $total_conquistas_stmt->fetchColumn();

    // Conta quantas conquistas o usuário tem
    $user_conquistas_stmt = $pdo->prepare("SELECT COUNT(*) FROM usuario_conquistas WHERE usuario_id = ? AND conquista_id != 6");
    $user_conquistas_stmt->execute([$usuario_id]);
    $user_total = $user_conquistas_stmt->fetchColumn();

    if ($user_total >= $total_conquistas) {
        verificar_e_conceder_conquista(6, $usuario_id, $pdo); // Concede a conquista "Buddhau"
    }
}
?>
