<?php
require_once 'includes/config.php';
require_once 'includes/conquistas_engine.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['sucesso' => false, 'erro' => 'Usuário não autenticado.']);
    exit();
}

$usuario_id = $_SESSION['usuario_id'];
$dados = json_decode(file_get_contents('php://input'), true);
$evento = $dados['evento'] ?? '';
$detalhes = $dados['detalhes'] ?? [];

try {
    // Busca os dados atuais do usuário
    $stmt_user = $pdo->prepare("SELECT vidas, streak, moedas FROM usuarios WHERE id = ?");
    $stmt_user->execute([$usuario_id]);
    $usuario = $stmt_user->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode(['sucesso' => false, 'erro' => 'Usuário não encontrado.']);
        exit();
    }

    // LÓGICA DE VERIFICAÇÃO BASEADA NO EVENTO
    switch ($evento) {
        case 'ACERTOU_RESPOSTA':
            // Conquista "Em Chamas!" (Streak de 15)
            if ($usuario['streak'] >= 15) {
                verificar_e_conceder_conquista(1, $usuario_id, $pdo);
            }
            // Conquista "Tio Patinhas" (Acumular 1000 gemas)
            if ($usuario['moedas'] >= 1000) {
                verificar_e_conceder_conquista(2, $usuario_id, $pdo);
            }
            break;

        case 'ERROU_RESPOSTA':
            // Conquista "Gavião Arqueiro" (Errar a primeira pergunta)
            $pergunta_ordem = $detalhes['pergunta_ordem'] ?? 99;
            if ($pergunta_ordem === 1) { // A ordem da pergunta é 1 (primeira da etapa)
                verificar_e_conceder_conquista(4, $usuario_id, $pdo);
            }
            break;
        
        case 'PERDEU_TODAS_AS_VIDAS':
            // Conquista "Game Over"
            verificar_e_conceder_conquista(3, $usuario_id, $pdo);
            break;

        case 'ESCOLHEU_BOAS_PRATICAS':
            // Conquista "Boas Práticas"
             verificar_e_conceder_conquista(5, $usuario_id, $pdo);
            break;
    }

    echo json_encode(['sucesso' => true]);

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Erro de banco de dados: ' . $e->getMessage()]);
}
?>
