<?php
require_once 'includes/config.php';

try {
    // Consulta para buscar trilhas, etapas e perguntas
    $query = "
        SELECT 
            t.id AS trilha_id, t.nome AS trilha_nome, t.descricao AS trilha_descricao,
            e.id AS etapa_id, e.nome AS etapa_nome, e.descricao AS etapa_descricao, e.ordem AS etapa_ordem,
            p.id AS pergunta_id, p.tipo AS pergunta_tipo, p.enunciado AS pergunta_enunciado,
            p.resposta_correta AS pergunta_resposta, p.opcoes AS pergunta_opcoes, p.ordem AS pergunta_ordem
        FROM trilhas t
        LEFT JOIN etapas e ON e.trilha_id = t.id
        LEFT JOIN perguntas p ON p.etapa_id = e.id
        WHERE t.ativa = 1
        ORDER BY t.ordem, e.ordem, p.ordem
    ";

    $stmt = $pdo->query($query);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Estrutura os dados em um formato hierárquico
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
                'pergunta' => $row['pergunta_enunciado'],
                'resposta' => $row['pergunta_resposta'],
                'opcoes' => $row['pergunta_opcoes'] ? json_decode($row['pergunta_opcoes'], true) : []
            ];
        }
    }

    // Remove os índices numéricos das etapas
    foreach ($trilhas as &$trilha) {
        $trilha['etapas'] = array_values($trilha['etapas']);
    }

    echo json_encode(array_values($trilhas));
} catch (PDOException $e) {
    echo json_encode(['erro' => $e->getMessage()]);
}
?>