<?php
error_reporting(E_ALL); // 1 para mostrar todos los tipos de errores
ini_set('display_errors', 0); // para no mostrar errores
ini_set('log_errors', 1); // para logear errores
ini_set('error_log', __DIR__ . '/../logs/php-error.log'); // ruta del log de errores

require_once __DIR__ . '/../bootstrap.php';

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

    // Comprueba si el servicio viene en FormData (para subir files)
    $servicio = isset($_POST['servicio']) ? $_POST['servicio'] : null;

    // Si no viene en FormData, lo intenta obtener de JSON
    if (!$servicio) {
        $datos = json_decode(file_get_contents('php://input'));
        $servicio = $datos->servicio ?? null;
    }

    if (!$servicio) {
        throw new Exception('No se ha especificado el servicio', 400);
    }

    switch ($servicio) {
        case 'getPhotos':
            print json_encode($modelo->ObtenerPhotos());
            break;
        case 'getAcceptedPhotos':
            print json_encode($modelo->ObtenerPhotosAccepted());
            break;
        case 'getPhoto':
            if (!isset($datos->id)) {
                throw new Exception('ID de foto no especificado', 400);
            }
            print json_encode($modelo->ObtenerPhoto($datos->id));
            break;
        case 'getPhotosByUserId':
            if (!isset($datos->userId)) {
                throw new Exception('ID de usuario no especificado', 400);
            }
            print json_encode($modelo->ObtenerPhotosByUserId($datos->userId));
            break;
        case 'getPendingPhotos':
            print json_encode($modelo->ObtenerPhotosPending());
            break;
        case 'uploadPhoto':
            if (!isset($_FILES['image'])) {
                throw new Exception('No se ha enviado ninguna imagen', 400);
            }

            if (!$modelo->ValidarPhoto($_FILES['image'])) {
                throw new Exception('Imagen no válida', 400);
            }

            $filePath = $modelo->GuardarPhoto($_FILES['image']);
            if (!$filePath) {
                throw new Exception('No se pudo guardar la imagen', 500);
            }

            $photoData = new stdClass();
            $photoData->title = $_POST['title'];
            $photoData->description = $_POST['description'];
            $photoData->file_path = $filePath;
            $photoData->user_id = $_POST['user_id'] ?? null;
            $photoData->status = 'pending';

            if (!$modelo->InsertarPhoto($photoData)) {
                throw new Exception('No se pudo insertar en la base de datos', 500);
            }

            print json_encode(['result' => 'OK']);
            break;
        case 'updatePhoto':
            if (isset($_FILES['image'])) {
                // Si hay una nueva imagen, primero la guardamos
                if (!$modelo->ValidarPhoto($_FILES['image'])) {
                    throw new Exception('Imagen no válida', 400);
                }

                $filePath = $modelo->GuardarPhoto($_FILES['image']);
                if (!$filePath) {
                    throw new Exception('No se pudo guardar la imagen', 500);
                }

                $photoData = new stdClass();
                $photoData->id = $_POST['photo_id'];
                $photoData->title = $_POST['title'];
                $photoData->description = $_POST['description'];
                $photoData->file_path = $filePath;

                if (!$modelo->ActualizarPhoto($photoData)) {
                    throw new Exception('Error al actualizar la foto', 500);
                }
            } else {
                // Si no hay nueva imagen, actualizamos solo los datos
                if (!isset($datos)) {
                    throw new Exception('No se recibieron datos para actualizar', 400);
                }

                if (!$modelo->ActualizarPhoto($datos)) {
                    throw new Exception('Error al actualizar la foto', 500);
                }
            }
            print json_encode(['result' => 'OK']);
            break;
        case 'updateStatus':
            if (!$modelo->ActualizarStatus($datos)) {
                throw new Exception('Error al actualizar el estado', 500);
            }
            print json_encode($modelo->ObtenerPhotosPending());
            break;
        case 'likePhoto':
            if (!isset($datos->photoId) || !isset($datos->userId)) {
                throw new Exception('Faltan datos necesarios', 400);
            }

            if ($modelo->ExisteVoto($datos->photoId, $datos->userId)) {
                $modelo->BorrarVoto($datos->photoId, $datos->userId);
                print json_encode(['result' => 'OK', 'action' => 'unliked']);
            } else {
                $modelo->CrearVoto($datos->photoId, $datos->userId);
                print json_encode(['result' => 'OK', 'action' => 'liked']);
            }
            break;
        case 'deletePhoto':
            if (!isset($datos->id)) {
                throw new Exception('ID de foto no especificado', 400);
            }
            if (!$modelo->EliminarPhoto($datos->id)) {
                throw new Exception('Error al eliminar la foto', 500);
            }
            print json_encode(['result' => 'OK']);
            break;
        case 'getTopPhotosToday':
            print json_encode($modelo->ObtenerTopPhotosDeHoy());
            break;
        default:
            throw new Exception('Servicio no válido', 400);
    }
} catch (Exception $e) {
    error_log('Error en photos.php: ' . $e->getMessage());
    http_response_code($e->getCode() ?: 500);
    print json_encode(['result' => 'FAIL', 'error' => $e->getMessage()]);
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

    public function ObtenerPhotos()
    {
        try {
            $consulta = "SELECT * FROM photos ORDER BY upload_date DESC";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al obtener las fotos');
        }
    }

    public function ObtenerPhotosAccepted()
    {
        try {
            $consulta = "SELECT p.*, u.name as user_name 
                     FROM photos p 
                     JOIN users u ON p.user_id = u.id 
                     WHERE p.status = 'accepted' 
                     ORDER BY p.votes_count DESC";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al obtener las fotos aceptadas');
        }
    }

    public function ObtenerPhoto($id)
    {
        try {
            $consulta = "SELECT * FROM photos WHERE id = ?";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute([$id]);
            return $stm->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al obtener la foto');
        }
    }

    public function ObtenerPhotosByUserId($userId)
    {
        try {
            $consulta = "SELECT p.*, u.name as user_name 
                     FROM photos p 
                     JOIN users u ON p.user_id = u.id 
                     WHERE p.user_id = ?";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute([$userId]);
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al obtener las fotos del usuario');
        }
    }

    public function ObtenerPhotosPending()
    {
        try {
            $consulta = "SELECT p.*, u.name as user_name 
                     FROM photos p 
                     JOIN users u ON p.user_id = u.id 
                     WHERE p.status = 'pending'";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al obtener las fotos pendientes');
        }
    }

    public function InsertarPhoto($data)
    {
        try {
            $sql = "INSERT INTO photos (user_id, title, description, file_path, status) 
                    VALUES (?, ?, ?, ?, ?)";
            return $this->pdo->prepare($sql)->execute([
                $data->user_id,
                $data->title,
                $data->description,
                $data->file_path,
                $data->status ?? 'pending'
            ]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al insertar la foto');
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
            return $this->pdo->prepare($sql)->execute([
                $data->title,
                $data->description,
                $data->file_path,
                $data->id
            ]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al actualizar la foto');
        }
    }

    public function ActualizarStatus($data)
    {
        try {
            $sql = "UPDATE photos SET status = ? WHERE id = ?";
            return $this->pdo->prepare($sql)->execute([
                $data->status,
                $data->id
            ]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al actualizar el estado');
        }
    }

    public function EliminarPhoto($id)
    {
        try {
            $sql = "DELETE FROM photos WHERE id = ?";
            return $this->pdo->prepare($sql)->execute([$id]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al eliminar la foto');
        }
    }

    public function ValidarPhoto($file)
    {
        global $maxSize, $allowedTypes; // Para poder acceder a las variables de configuración

        if ($file['size'] > $maxSize) {
            throw new Exception('Archivo demasiado grande', 400);
        }

        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Tipo de archivo no permitido', 400);
        }

        return true;
    }    public function GuardarPhoto($file)
    {
        global $uploadDir; // La carpeta donde se guardarán las fotos (Establecida en config.php)
        global $envDir; // La carpeta donde se guardarán las fotos (Establecida en config.php)
        
        // Log para verificar el valor de uploadDir
        error_log("uploadDir value: " . ($uploadDir ?? 'NULL'));

        // Si la carpeta no existe, la crea
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('photo_', true) . '.' . $extension;
        $relativePath = $envDir . $filename;
        $fullPath = $uploadDir . $filename;


        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            throw new Exception('No se pudo guardar el archivo', 500);
        }

        return $relativePath;
    }

    public function ExisteVoto($photoId, $userId)
    {
        try {
            $sql = "SELECT COUNT(*) FROM votes WHERE photo_id = ? AND user_id = ?";
            $stm = $this->pdo->prepare($sql);
            $stm->execute([$photoId, $userId]);
            return $stm->fetchColumn() > 0;
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al verificar el voto');
        }
    }

    public function BorrarVoto($photoId, $userId)
    {
        try {
            $sql = "DELETE FROM votes WHERE photo_id = ? AND user_id = ?";
            return $this->pdo->prepare($sql)->execute([$photoId, $userId]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al borrar el voto');
        }
    }

    public function CrearVoto($photoId, $userId)
    {
        try {
            $sql = "INSERT INTO votes (photo_id, user_id) VALUES (?, ?)";
            return $this->pdo->prepare($sql)->execute([$photoId, $userId]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al crear el voto');
        }
    }

    public function ObtenerTopPhotosDeHoy()
    {
        try {
            $consulta = "SELECT p.*, u.name as user_name 
                        FROM photos p 
                        JOIN users u ON p.user_id = u.id 
                        WHERE p.status = 'accepted' 
                        AND DATE(p.upload_date) = CURDATE()
                        ORDER BY p.votes_count DESC 
                        LIMIT 10";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception('Error al obtener las fotos más votadas');
        }
    }
}