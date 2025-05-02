<?php

header("Access-Control-Allow-Origin: *"); // allow request from all origin
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization");
header('Content-Type: application/json');  //  Todo se devolverá en formato JSON.

$modelo = new Modelo();

$datos = file_get_contents('php://input');
$datos = json_decode($datos);

if ($datos != null) {
    switch ($datos->servicio) {
        case 'getConfig':
            print json_encode($modelo->ObtenerConfig());
            break;
        case 'updateConfig':
            if ($modelo->ActualizarConfig($datos))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;
    }
}


class Modelo
{
    private $pdo;

    public function __CONSTRUCT()
    {
        try {
            require_once('../config.php');
            $this->pdo = $pdo;
        } catch (Exception $e) {
            die($e->getMessage());
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
            die($e->getMessage());
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
            $this->pdo->prepare($sql)->execute(array(
                $data->limiteFotos,
                $data->recepcionInicio,
                $data->recepcionFin,
                $data->votacionInicio,
                $data->votacionFin
            ));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }
}