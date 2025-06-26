<?php
require_once 'includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    http_response_code(403);
    echo json_encode(['erro' => 'Acesso negado']);
    exit();
}

$dados = json_decode(file_get_contents("php://input"), true);
$tipo_evento = $dados['tipo_evento'] ?? '';
$usuario_id = $_SESSION['usuario_id'];
$hoje = date('Y-m-d');

if (empty($tipo_evento)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Tipo de evento não especificado']);
    exit();
}

try {
    $pdo->beginTransaction();

    // Encontra missões ativas (não concluídas) do usuário para hoje que correspondem ao tipo de evento
    $query = "
        SELECT md.id, md.progresso, mdef.meta, mdef.recompensa_gemas, mdef.id as missao_def_id
        FROM missoes_diarias md
        JOIN missoes_definicoes mdef ON md.missao_id = mdef.id
        WHERE md.usuario_id = ? AND md.data = ? AND mdef.tipo_evento = ? AND md.concluida = 0
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([$usuario_id, $hoje, $tipo_evento]);
    $missoes_afetadas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $recompensas = [];

    foreach ($missoes_afetadas as $missao) {
        // Incrementa o progresso
        $novo_progresso = $missao['progresso'] + 1;

        $update_stmt = $pdo->prepare("UPDATE missoes_diarias SET progresso = ? WHERE id = ?");
        $update_stmt->execute([$novo_progresso, $missao['id']]);

        // Verifica se a missão foi concluída
        if ($novo_progresso >= $missao['meta']) {
            // Marca como concluída
            $concluir_stmt = $pdo->prepare("UPDATE missoes_diarias SET concluida = 1 WHERE id = ?");
            $concluir_stmt->execute([$missao['id']]);

            // Adiciona a recompensa ao usuário
            $recompensa = $missao['recompensa_gemas'];
            $user_update_stmt = $pdo->prepare("UPDATE usuarios SET moedas = moedas + ? WHERE id = ?");
            $user_update_stmt->execute([$recompensa, $usuario_id]);

            $recompensas[] = ['missao_id' => $missao['missao_def_id'], 'gemas' => $recompensa];
        }
    }

    $pdo->commit();

    // Retorna as recompensas ganhas para o frontend
    if (!empty($recompensas)) {
        echo json_encode(['sucesso' => true, 'recompensas' => $recompensas]);
    } else {
        echo json_encode(['sucesso' => true, 'recompensas' => []]);
    }

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['erro' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>