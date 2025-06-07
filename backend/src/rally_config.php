<?php
error_reporting(E_ALL); // 1 para mostrar todos los tipos de errores
ini_set('display_errors', 0); // para no mostrar errores
ini_set('log_errors', 1); // para logear errores
ini_set('error_log', __DIR__ . '/../logs/php-error.log'); // ruta del log de errores

require_once(__DIR__ . '/../config.php');
require __DIR__ . '/../vendor/autoload.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization");
header('Content-Type: application/json');

// Manejo de solicitud OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $modelo = new Modelo();
    $datos = json_decode(file_get_contents('php://input'));

    if ($datos === null) {
        throw new Exception('Datos de entrada inválidos', 400);
    }

    switch ($datos->servicio) {
        case 'getConfig':
            print json_encode($modelo->ObtenerConfig());
            break;
        case 'updateConfig':
            $resultado = $modelo->ActualizarConfig($datos);
            print json_encode([
                'result' => $resultado ? 'OK' : 'FAIL',
                'message' => $resultado ? 'Configuración actualizada correctamente' : 'Error al actualizar la configuración'
            ]);
            break;
        default:
            throw new Exception('Servicio no válido', 400);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    print json_encode([
        'result' => 'FAIL',
        'error' => $e->getMessage()
    ]);
}

class Modelo
{
    private $pdo;

    public function __CONSTRUCT()
    {
        try {
            include(__DIR__ . '/../config.php');
            $this->pdo = $pdo;
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al conectar con la base de datos');
        }
    }

    public function ObtenerConfig()
    {
        try {
            $consulta = "SELECT * FROM settings";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al obtener la configuración');
        }
    }

    public function ActualizarConfig($data)
    {
        try {
            $sql = "UPDATE settings SET 
                    max_photos_per_user = ?,
                    upload_start_date = ?,
                    upload_end_date = ?,
                    voting_start_date = ?,
                    voting_end_date = ?
                    WHERE id = 1";

            return $this->pdo->prepare($sql)->execute([
                $data->limiteFotos,
                $data->recepcionInicio,
                $data->recepcionFin,
                $data->votacionInicio,
                $data->votacionFin
            ]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al actualizar la configuración');
        }
    }
}