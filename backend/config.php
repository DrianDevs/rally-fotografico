<?php

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;


if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

// Configuración de la base de datos
$host = getenv('DB_HOST');
$db = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$charset = getenv('DB_CHARSET');

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error de conexión a la base de datos', 'message' => $e->getMessage()]);
    exit;
}


// Clave secreta para JWT
$jwt_secret = getenv('JWT_SECRET');

// Configuración de Resend
$resend_api_key = getenv('RESEND_API_KEY');
$from_email = getenv('FROM_EMAIL');
$app_url = getenv('APP_URL');

// Configuración para fotos
$uploadDir = __DIR__ . '/' . getenv('UPLOAD_DIR');
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$maxSize = (int) getenv('MAX_FILE_SIZE');
