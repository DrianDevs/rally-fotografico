<?php

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Configuración de la base de datos
$host = $_ENV['DB_HOST'];
$db = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];
$charset = $_ENV['DB_CHARSET'];

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

// Clave secreta para JWT
$jwt_secret = $_ENV['JWT_SECRET'];

// Configuración de Resend
$resend_api_key = $_ENV['RESEND_API_KEY'];
$from_email = $_ENV['FROM_EMAIL'];
$app_url = $_ENV['APP_URL'];

// Configuración para fotos
$uploadDir = __DIR__ . '/' . $_ENV['UPLOAD_DIR'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$maxSize = (int) $_ENV['MAX_FILE_SIZE'];
