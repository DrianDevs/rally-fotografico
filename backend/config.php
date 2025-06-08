<?php
error_reporting(E_ALL); // 1 para mostrar todos los tipos de errores
ini_set('display_errors', 0); // para no mostrar errores
ini_set('log_errors', 1); // para logear errores
ini_set('error_log', __DIR__ . '/logs/php-error.log'); // ruta del log de errores

require_once __DIR__ . '/vendor/autoload.php';

// Configuración de headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');

use Dotenv\Dotenv;


if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}


if (!function_exists('env')) {
    function env($key, $default = null) {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }
}

// Configuración de la base de datos
$host = env('DB_HOST');
$db = env('DB_NAME');
$user = env('DB_USER');
$pass = env('DB_PASS');
$charset = env('DB_CHARSET');

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error de conexión a la base de datos' . $host . $db . $user . $pass . $charset, 'message' => $e->getMessage()]);
    exit;
}


// Clave secreta para JWT
$jwt_secret = env('JWT_SECRET');

// Configuración de Resend
$resend_api_key = env('RESEND_API_KEY');
$from_email = env('FROM_EMAIL');
$app_url = env('APP_URL');

// Configuración para fotos
$envDir = env('ENV_DIR');
$uploadDir = __DIR__ . '/' . env('UPLOAD_DIR');
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$maxSize = (int) env('MAX_FILE_SIZE');
