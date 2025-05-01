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
            print json_encode($modelo->ObtenerOwners());
            break;
        case 'updateConfig':
            // Falta updateConfig
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

    public function ObtenerOwners()
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
}