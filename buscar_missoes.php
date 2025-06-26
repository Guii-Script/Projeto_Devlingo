<?php
require_once 'includes/config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Usuário não autenticado']);
    exit();
}

$usuario_id = $_SESSION['usuario_id'];
$hoje = date('Y-m-d');

try {
    // Verifica se já existem missões para o usuário hoje
    $query = "
        SELECT
            md.id AS id_diaria,
            mdef.nome,
            mdef.descricao,
            mdef.meta,
            mdef.recompensa_gemas,
            md.progresso,
            md.concluida
        FROM missoes_diarias md
        JOIN missoes_definicoes mdef ON md.missao_id = mdef.id
        WHERE md.usuario_id = ? AND md.data = ?
    ";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$usuario_id, $hoje]);
    $missoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Se não houver missões, cria duas novas
    if (empty($missoes)) {
        // Seleciona 2 missões aleatórias da tabela de definições
        $stmt_def = $pdo->query("SELECT id FROM missoes_definicoes ORDER BY RAND() LIMIT 2");
        $definicoes = $stmt_def->fetchAll(PDO::FETCH_ASSOC);

        // Insere as novas missões para o usuário
        $insert_query = "INSERT INTO missoes_diarias (usuario_id, missao_id, data) VALUES (?, ?, ?)";
        $stmt_insert = $pdo->prepare($insert_query);
        foreach ($definicoes as $def) {
            $stmt_insert->execute([$usuario_id, $def['id'], $hoje]);
        }

        // Busca novamente para retornar os dados corretos
        $stmt->execute([$usuario_id, $hoje]);
        $missoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    header('Content-Type: application/json');
    echo json_encode($missoes);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>