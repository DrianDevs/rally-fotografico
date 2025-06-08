<?php

require_once('../vendor/autoload.php');

// Configuración de la base de datos
$host = 'localhost';
$db = 'rally_fotografico';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

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
$jwt_secret = 'clave-super-secreta-que-deberías-cambiar';

// Configuración de Resend
$resend_api_key = 're_aru5N42R_386Cmt1cmPYfZ8kZkTifsHfB';
$from_email = 'onboarding@resend.dev'; // Dominio de prueba, cambiar en el futuro
$app_url = 'http://localhost:4200'; // URL del frontend

// Configuración para fotos
$uploadDir = __DIR__ . '/uploads/';
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5 MB
