<?php
error_reporting(E_ALL); // 1 para mostrar todos los tipos de errores
ini_set('display_errors', 0); // para no mostrar errores
ini_set('log_errors', 1); // para logear errores
ini_set('error_log', __DIR__ . '/../logs/php-error.log'); // ruta del log de errores

require_once(__DIR__ . '/../config.php');

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization");
header('Content-Type: application/json');

try {
    $modelo = new Modelo();

    // Comprueba si el servicio viene en FormData (para subir files)
    $servicio = isset($_POST['servicio']) ? $_POST['servicio'] : null;

    // Si no viene en FormData, lo intenta obtener de JSON
    if (!$servicio) {
        $datos = json_decode(file_get_contents('php://input'));
        $servicio = $datos->servicio ?? null;
    }

    if ($servicio) {
        switch ($servicio) {
            case 'getPhotos':
                print json_encode($modelo->ObtenerPhotos());
                break;
            case 'getAcceptedPhotos':
                print json_encode($modelo->ObtenerPhotosAccepted());
                break;
            case 'getPhoto':
                print json_encode($modelo->ObtenerPhoto($datos->id));
                break;
            case 'getPhotosByUserId':
                print json_encode($modelo->ObtenerPhotosByUserId($datos->userId));
                break;
            case 'getPendingPhotos':
                print json_encode($modelo->ObtenerPhotosPending());
                break;
            case 'uploadPhoto':
                // error_log('DEBUG: $_FILES contents: ' . print_r($_FILES, true)); // Para logear los detalles de la imagen
                // error_log('DEBUG: $_POST contents: ' . print_r($_POST, true));   // Para logear los detalles del formulario

                if (!isset($_FILES['image'])) {
                    print json_encode(['result' => 'FAIL', 'error' => 'No se ha enviado ninguna imagen']);
                    break;
                }

                if (!$modelo->ValidarPhoto($_FILES['image'])) {
                    print json_encode(['result' => 'FAIL', 'error' => 'Imagen no válida']);
                    break;
                }

                $filePath = $modelo->GuardarPhoto($_FILES['image']);
                if (!$filePath) {
                    print json_encode(['result' => 'FAIL', 'error' => 'No se pudo guardar la imagen']);
                    break;
                }

                $photoData = new stdClass();
                $photoData->title = $_POST['title'];
                $photoData->description = $_POST['description'];
                $photoData->file_path = $filePath;
                $photoData->user_id = $_POST['user_id'] ?? null;
                $photoData->status = 'pending';

                print $modelo->InsertarPhoto($photoData) ?
                    json_encode(['result' => 'OK']) :
                    json_encode(['result' => 'FAIL', 'error' => 'No se pudo insertar en la base de datos']);
                break;
            case 'updatePhoto':
                if ($modelo->ActualizarPhoto($datos))
                    print json_encode(['result' => 'OK']);
                else
                    print json_encode(['result' => 'FAIL']);
                break;
            case 'updateStatus':
                if ($modelo->ActualizarStatus($datos)) {
                    $pendingPhotos = $modelo->ObtenerPhotosPending();
                    print json_encode($pendingPhotos);
                } else {
                    print json_encode(['result' => 'FAIL']);
                }
                break;
            case 'deletePhoto':
                if ($modelo->EliminarPhoto($datos->id))
                    print '{"result":"OK"}';
                else
                    print '{"result":"FAIL"}';
                break;
            default:
                print json_encode(['result' => 'FAIL', 'error' => 'Servicio no válido']);
                break;
        }
    } else {
        error_log('DEBUG: No se ha encontrado el servicio');
        print json_encode(['result' => 'FAIL', 'error' => 'No se ha encontrado el servicio']);
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    print json_encode(['result' => 'FAIL', 'error' => 'Error al procesar la solicitud']);
}


class Modelo
{
    private $pdo;

    public function __CONSTRUCT()
    {
        try {
            require_once(__DIR__ . '/../config.php');
            global $pdo;
            $this->pdo = $pdo;
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al conectar con la base de datos');
        }
    }

    public function ObtenerPhotos()
    {
        try {
            $consulta = "SELECT * FROM photos ORDER BY upload_date DESC";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ObtenerPhotosAccepted()
    {
        try {
            $consulta = "SELECT * FROM photos WHERE status = 'accepted' ORDER BY upload_date DESC";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ObtenerPhoto($id)
    {
        try {
            $consulta = "SELECT * FROM photos WHERE id = ?";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute(array($id));
            return $stm->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ObtenerPhotosByUserId($userId)
    {
        try {
            $consulta = "SELECT * FROM photos WHERE user_id = ?";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute(array($userId));
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ObtenerPhotosPending()
    {
        try {
            $consulta = "SELECT * FROM photos WHERE status = 'pending'";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function InsertarPhoto($data)
    {
        try {
            $sql = "INSERT INTO photos (user_id, title, description, file_path, status) 
                    VALUES (?, ?, ?, ?, ?)";
            $this->pdo->prepare($sql)->execute(array(
                $data->user_id,
                $data->title,
                $data->description,
                $data->file_path,
                $data->status ?? 'pending'
            ));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ActualizarPhoto($data)
    {
        try {
            $sql = "UPDATE photos SET 
                    title = ?,
                    description = ?,
                    file_path = ?
                WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array(
                $data->title,
                $data->description,
                $data->file_path,
                $data->id
            ));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ActualizarStatus($data)
    {
        try {
            $sql = "UPDATE photos SET status = ? WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array(
                $data->status,
                $data->id
            ));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function EliminarPhoto($id)
    {
        try {
            $sql = "DELETE FROM photos WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array($id));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ValidarPhoto($file)
    {
        global $maxSize, $allowedTypes; // Para poder acceder a las variables de configuración

        if ($file['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['error' => 'Archivo demasiado grande']);
            return false;
        }

        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Tipo de archivo no permitido']);
            return false;
        }

        return true;
    }

    public function GuardarPhoto($file)
    {
        global $uploadDir; // Para poder acceder a la carpeta

        // Si la carpeta no existe, la crea
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Crea la ruta completa, y si faltan carpetas en el camino, también se crean
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('photo_', true) . '.' . $extension;
        $relativePath = 'uploads/' . $filename;
        $fullPath = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo guardar el archivo']);
            return false;
        }

        return $relativePath;

    }

}