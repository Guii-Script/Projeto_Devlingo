<?php
require_once 'includes/config.php';

// 1. Verificar se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    // Se não estiver logado, retorna um JSON com um array vazio.
    // Isso garante que a tela de trilhas não mostre nada.
    echo json_encode([]);
    exit();
}

$usuario_id = $_SESSION['usuario_id'];

try {
    // 2. Modificar a consulta SQL para buscar apenas as trilhas do usuário
    $query = "
        SELECT 
            t.id AS trilha_id, t.nome AS trilha_nome, t.descricao AS trilha_descricao,
            e.id AS etapa_id, e.nome AS etapa_nome, e.descricao AS etapa_descricao, e.ordem AS etapa_ordem,
            p.id AS pergunta_id, p.tipo AS pergunta_tipo, p.enunciado AS pergunta_enunciado,
            p.resposta_correta AS pergunta_resposta, p.opcoes AS pergunta_opcoes, 
            p.ordem AS pergunta_ordem, p.recompensa AS pergunta_recompensa
        FROM usuario_trilhas ut -- Começamos pela tabela que liga o usuário à trilha
        JOIN trilhas t ON ut.trilha_id = t.id -- Juntamos com a tabela de trilhas
        LEFT JOIN etapas e ON e.trilha_id = t.id
        LEFT JOIN perguntas p ON p.etapa_id = e.id
        WHERE ut.usuario_id = ? AND t.ativa = 1 -- Filtramos pelo ID do usuário logado e garantimos que a trilha está ativa
        ORDER BY t.ordem, e.ordem, p.ordem
    ";

    // 3. Preparar e executar a consulta de forma segura
    $stmt = $pdo->prepare($query);
    $stmt->execute([$usuario_id]);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // O restante do código para montar a estrutura JSON permanece o mesmo
    $trilhas = [];
    foreach ($resultados as $row) {
        $trilhaId = $row['trilha_id'];
        $etapaId = $row['etapa_id'];

        if (!isset($trilhas[$trilhaId])) {
            $trilhas[$trilhaId] = [
                'nome' => $row['trilha_nome'],
                'descricao' => $row['trilha_descricao'],
                'etapas' => []
            ];
        }

        if ($etapaId && !isset($trilhas[$trilhaId]['etapas'][$etapaId])) {
            $trilhas[$trilhaId]['etapas'][$etapaId] = [
                'nome' => $row['etapa_nome'],
                'descricao' => $row['etapa_descricao'],
                'perguntas' => []
            ];
        }

        if ($row['pergunta_id']) {
            $trilhas[$trilhaId]['etapas'][$etapaId]['perguntas'][] = [
                'tipo' => $row['pergunta_tipo'],
                'enunciado' => $row['pergunta_enunciado'],
                'resposta_correta' => $row['pergunta_resposta'],
                'opcoes' => $row['pergunta_opcoes'] ? json_decode($row['pergunta_opcoes'], true) : []
            ];
        }
    }

    foreach ($trilhas as &$trilha) {
        $trilha['etapas'] = array_values($trilha['etapas']);
    }

    // Retornar o JSON com as trilhas corretas (ou um array vazio se o usuário não tiver nenhuma)
    echo json_encode(array_values($trilhas));

} catch (PDOException $e) {
    // Em caso de erro, retornar um JSON de erro
    http_response_code(500);
    echo json_encode(['erro' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>