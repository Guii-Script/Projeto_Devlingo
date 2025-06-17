<?php
require_once 'includes/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $quantidade = (int)$dados['quantidade'];
    $usuarioId = (int)$dados['usuario_id']; // Adicionamos o ID do usuário no frontend
    
    try {
        // Atualiza as gemas do usuário
        $stmt = $pdo->prepare("UPDATE usuarios SET moedas = moedas + ? WHERE id = ?");
        $stmt->execute([$quantidade, $usuarioId]);
        
        // Pega o novo saldo para retornar
        $stmt = $pdo->prepare("SELECT moedas FROM usuarios WHERE id = ?");
        $stmt->execute([$usuarioId]);
        $usuario = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'novoSaldo' => $usuario['moedas']
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido'
    ]);
}
?>