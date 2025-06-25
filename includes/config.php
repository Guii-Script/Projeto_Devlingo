<?php
// Inicia a sessão. Essencial para que $_SESSION funcione em todas as páginas.
session_start();

// --- CONFIGURAÇÃO DO BANCO DE DADOS ---
$host = 'localhost';
$db   = 'devlingo';
$user = 'root';
$pass = ''; // Deixe em branco se não houver senha
$charset = 'utf8mb4';

// Data Source Name (DSN) para a conexão PDO
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Opções do PDO para um comportamento consistente
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lança exceções em caso de erro
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Retorna resultados como arrays associativos
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Usa prepares nativos do banco de dados
];

try {
    // Cria a instância do PDO (o objeto de conexão)
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Em caso de falha na conexão, encerra o script com uma mensagem de erro.
    // Em um ambiente de produção, você poderia logar este erro em vez de exibi-lo.
    die("Erro fatal ao conectar ao banco de dados: " . $e->getMessage());
}
?>