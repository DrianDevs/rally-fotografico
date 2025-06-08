<?php
require '../config.php';
require_once('../vendor/autoload.php');

use Firebase\JWT\JWT;

// Configuración de headers CORS
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');


// Ignora la solicitud OPTIONS que envía el navegador para verificar CORS
// Esta solicitud se envía antes de la solicitud POST real
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Validación de datos de entrada
    $input = json_decode(file_get_contents("php://input"), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        throw new Exception('Faltan datos de autenticación', 400);
    }

    // Búsqueda del usuario en la base de datos
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validación de credenciales
    if (!$user || !password_verify($password, $user['password_hash'])) {
        throw new Exception('Credenciales incorrectas', 401);
    }

    // Generación del token JWT
    $payload = [
        'sub' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (60 * 60 * 24) // 24 horas
    ];

    $jwt = JWT::encode($payload, $jwt_secret, 'HS256');

    // Respuesta exitosa
    print json_encode([
        'result' => 'OK',
        'data' => [
            'token' => $jwt,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'role' => $user['role'],
                'email' => $user['email']
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    print json_encode([
        'result' => 'FAIL',
        'error' => $e->getMessage()
    ]);
}
