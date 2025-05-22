<?php
// Configurações do banco de dados
$host = 'localhost';
$dbname = 'devlingo';
$username = 'root'; // Altere conforme necessário
$password = ''; // Altere conforme necessário

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro na conexão com o banco de dados: " . $e->getMessage());
}

// Inicia a sessão
session_start();

// Função para exibir mensagens
function exibirMensagem() {
    if (isset($_SESSION['mensagem'])) {
        $tipo = $_SESSION['mensagem']['tipo'];
        $texto = $_SESSION['mensagem']['texto'];
        echo "<div class='mensagem {$tipo}'>{$texto}</div>";
        unset($_SESSION['mensagem']);
    }
}

// Função para definir mensagens
function definirMensagem($tipo, $texto) {
    $_SESSION['mensagem'] = [
        'tipo' => $tipo,
        'texto' => $texto
    ];
}
?>