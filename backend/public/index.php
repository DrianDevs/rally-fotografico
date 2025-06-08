<?php

require_once __DIR__ . '/../bootstrap.php';

// Obtener la ruta de la solicitud
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Eliminar la barra inicial si existe
$path = ltrim($path, '/');

// Si la ruta está vacía, establecer una ruta por defecto
if (empty($path)) {
    $path = 'login.php';
}

// Construir la ruta al archivo
$file_path = __DIR__ . '/../src/' . $path;

// Verificar si el archivo existe
if (file_exists($file_path)) {
    require_once $file_path;
} else {
    // Si el archivo no existe, devolver un error 404
    header('HTTP/1.0 404 Not Found');
    echo json_encode(['error' => 'Endpoint no encontrado']);
}