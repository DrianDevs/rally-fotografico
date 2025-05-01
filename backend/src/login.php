<?php
require '../config.php';
require '../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');


// Ignorar la solicitud de preflight OPTIONS que envía el navegador para verificar CORS
// Esta solicitud se envía antes de la solicitud POST real
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Recibir JSON de Angular
$input = json_decode(file_get_contents("php://input"), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos']);
    exit;
}

// 2. Buscar al usuario en la base de datos
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);


if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales incorrectas']);
    exit;
}

// 3. Crear el JWT
$payload = [
    'sub' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
    'exp' => time() + (60 * 60 * 24) // 24 horas
];

$jwt = JWT::encode($payload, $jwt_secret, 'HS256');

// 4. Devolver el token
echo json_encode([
    'token' => $jwt,
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'role' => $user['role'],
        'email' => $user['email']
    ]
]);
