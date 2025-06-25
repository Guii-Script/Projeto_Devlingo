<?php
require_once 'includes/config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['sucesso' => false, 'erro' => 'Usuário não autenticado.']);
    exit();
}

$dados = json_decode(file_get_contents('php://input'), true);

if (!isset($dados['vidas'])) {
    echo json_encode(['sucesso' => false, 'erro' => 'Dados incompletos.']);
    exit();
}

try {
    $usuario_id = $_SESSION['usuario_id'];
    $vidas = (int)$dados['vidas'];
    $streak = (int)$dados['streak'];
    $moedas = (int)$dados['moedas'];

    if ($vidas <= 0) {
        // Se as vidas acabaram, registra o tempo de início da recarga.
        // A condição "AND tempo_recarga IS NULL" garante que isso aconteça apenas uma vez por "morte".
        $sql = "UPDATE usuarios SET vidas = :vidas, streak = :streak, moedas = :moedas, tempo_recarga = NOW() 
                WHERE id = :usuario_id AND tempo_recarga IS NULL";
    } else {
        // Se as vidas foram restauradas (>0), limpa o tempo de recarga (definindo como NULL).
        $sql = "UPDATE usuarios SET vidas = :vidas, streak = :streak, moedas = :moedas, tempo_recarga = NULL 
                WHERE id = :usuario_id";
    }
    
    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(':vidas', $vidas, PDO::PARAM_INT);
    $stmt->bindParam(':streak', $streak, PDO::PARAM_INT);
    $stmt->bindParam(':moedas', $moedas, PDO::PARAM_INT);
    $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['sucesso' => true]);

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Erro ao salvar progresso: ' . $e->getMessage()]);
}
?>