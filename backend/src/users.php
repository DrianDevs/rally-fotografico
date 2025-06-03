<?php

// Cargar el autoloader de Composer al inicio
require_once('../vendor/autoload.php');

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
        case 'getUsers':
            print json_encode($modelo->ObtenerUsers());
            break;
        case 'getUser':
            print json_encode($modelo->ObtenerUser($datos->id));
            break;
        case 'getMostVotedUsers':
            print json_encode($modelo->ObtenerUsuariosMasVotados());
            break;
        case 'insertarUser':
            if ($modelo->InsertarUser($datos))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;
        case 'updateUser':
            if ($modelo->ActualizarUser($datos))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;
        case 'updatePassword':
            if ($modelo->ActualizarPassword($datos))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;
        case 'deleteUser':
            if ($modelo->EliminarUser($datos->id))
                print '{"result":"OK"}';
            else
                print '{"result":"FAIL"}';
            break;
        case 'forgotPassword':
            $resultado = $modelo->ForgotPassword($datos->email);
            if ($resultado['success'])
                print json_encode(['result' => 'OK', 'message' => $resultado['message']]);
            else
                print json_encode(['result' => 'FAIL', 'message' => $resultado['message']]);
            break;
        case 'verificarToken':
            $resultado = $modelo->VerificarToken($datos->token);
            print json_encode([
                'result' => $resultado['success'] ? 'OK' : 'FAIL',
                'valid' => $resultado['success'],
                'message' => $resultado['message']
            ]);
            break;
        case 'resetPassword':
            $resultado = $modelo->ResetPassword($datos->token, $datos->password);
            if ($resultado['success'])
                print json_encode(['result' => 'OK', 'message' => $resultado['message']]);
            else
                print json_encode(['result' => 'FAIL', 'message' => $resultado['message']]);
            break;
        case 'validateResetToken':
            $resultado = $modelo->ValidateResetToken($datos->token);
            if ($resultado['success'])
                print json_encode(['result' => 'OK', 'message' => $resultado['message']]);
            else
                print json_encode(['result' => 'FAIL', 'message' => $resultado['message']]);
            break;
    }
}


class Modelo
{
    private $pdo;
    private $resend_api_key;
    private $from_email;
    private $app_url;

    public function __CONSTRUCT()
    {
        try {
            require_once('../config.php');
            $this->pdo = $pdo;
            $this->resend_api_key = $resend_api_key;
            $this->from_email = $from_email;
            $this->app_url = $app_url;
        } catch (Exception $e) {
            error_log($e->getMessage());
        }
    }

    public function ObtenerUsers()
    {
        try {
            $consulta = "SELECT * FROM users ORDER BY id";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return $e->getMessage();
        }
    }

    public function ObtenerUser($id)
    {
        try {
            $consulta = "SELECT * FROM users WHERE id = ?";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute(array($id));
            return $stm->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return $e->getMessage();
        }
    }

    public function ObtenerUsuariosMasVotados()
    {
        try {
            $consulta = "SELECT u.id AS user_id, u.name, SUM(p.votes_count) AS total_votes
                        FROM users u JOIN photos p ON u.id = p.user_id
                        GROUP BY u.id, u.name ORDER BY total_votes DESC
                        LIMIT 10;";
            $stm = $this->pdo->prepare($consulta);
            $stm->execute();
            return $stm->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return $e->getMessage();
        }
    }

    public function InsertarUser($data)
    {
        try {
            $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO users (email, password_hash, name, role) VALUES (?,?,?,?)";
            $this->pdo->prepare($sql)->execute(array(
                $data->email,
                $passwordHash,
                $data->name,
                $data->role
            ));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ActualizarUser($data)
    {
        try {
            $sql = "UPDATE users SET 
                    email = ?,
                    name = ?,
                    role = ?
                WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array(
                $data->email,
                $data->name,
                $data->role,
                $data->id
            ));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function ActualizarPassword($data)
    {
        try {
            $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);
            $sql = "UPDATE users SET password_hash = ? WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array(
                $passwordHash,
                $data->id
            ));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function EliminarUser($id)
    {
        try {
            $sql = "DELETE FROM users WHERE id = ?";
            $this->pdo->prepare($sql)->execute(array($id));
            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }
    public function ForgotPassword($email)
    {
        try {
            // Verificar si el email existe en la base de datos
            $sql = "SELECT id, name FROM users WHERE email = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array($email));
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'El correo electrónico no está registrado en nuestro sistema'
                ];
            }

            // Generar token único
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token válido por 1 hora            // Limpiar tokens anteriores del usuario
            $cleanupSql = "DELETE FROM password_resets WHERE user_id = ?";
            $this->pdo->prepare($cleanupSql)->execute(array($user['id']));

            // Guardar token en BD
            $insertSql = "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)";
            $this->pdo->prepare($insertSql)->execute(array($user['id'], $token, $expiresAt));

            // Enviar email con enlace de recuperación
            $emailSent = $this->sendPasswordResetEmail($email, $user['name'], $token);

            if ($emailSent) {
                return [
                    'success' => true,
                    'message' => 'Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Error al enviar el correo electrónico. Inténtalo de nuevo más tarde'
                ];
            }

        } catch (Exception $e) {
            error_log($e->getMessage());
            return [
                'success' => false,
                'message' => 'Error interno del servidor'
            ];
        }
    }
    private function sendPasswordResetEmail($email, $name, $token)
    {
        try {
            $resend = \Resend::client($this->resend_api_key);

            $resetLink = $this->app_url . '/reset-password?token=' . $token;

            $htmlContent = '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Recuperar Contraseña - Rally Fotográfico</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }                    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; background-color: #2563eb; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Rally Fotográfico</h1>
                    </div>
                    <div class="content">
                        <h2>Restablecer tu contraseña</h2>
                        <p>Hola ' . htmlspecialchars($name) . ',</p>
                        <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú quien hizo esta solicitud, puedes ignorar este correo.</p>
                        <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                        <a href="' . $resetLink . '" class="button">Restablecer Contraseña</a>
                        <p>Este enlace expirará en 1 hora por seguridad.</p>
                        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                        <p>' . $resetLink . '</p>
                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                        <p>&copy; 2025 Rally Fotográfico. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>';
            $result = $resend->emails->send([
                'from' => $this->from_email,
                'to' => [$email],
                'subject' => 'Recuperar Contraseña - Rally Fotográfico',
                'html' => $htmlContent,
            ]);

            return true;

        } catch (Exception $e) {
            error_log('Error enviando email: ' . $e->getMessage());
            return false;
        }
    }

    public function VerificarToken($token)
    {
        try {
            // Verificar que el token existe y no ha expirado
            $sql = "SELECT user_id FROM password_resets 
                    WHERE token = ? AND expires_at > NOW() AND used = FALSE";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array($token));
            $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

            $isValid = $tokenData !== false;

            return [
                'success' => $isValid,
                'message' => $isValid ? 'Token válido' : 'Token inválido y/o expirado'
            ];

        } catch (Exception $e) {
            error_log($e->getMessage());
            return [
                'success' => false,
                'message' => 'Error interno del servidor'
            ];
        }
    }

    public function ResetPassword($token, $newPassword)
    {
        try {
            // Verificar que el token existe y no ha expirado
            $sql = "SELECT user_id FROM password_resets 
                    WHERE token = ? AND expires_at > NOW() AND used = FALSE";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array($token));
            $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$tokenData) {
                return [
                    'success' => false,
                    'message' => 'Token inválido o expirado'
                ];
            }

            // Actualizar la contraseña del usuario
            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateSql = "UPDATE users SET password_hash = ? WHERE id = ?";
            $this->pdo->prepare($updateSql)->execute(array($passwordHash, $tokenData['user_id']));            // Marcar el token como usado
            $markUsedSql = "UPDATE password_resets SET used = TRUE WHERE token = ?";
            $this->pdo->prepare($markUsedSql)->execute(array($token));

            return [
                'success' => true,
                'message' => 'Contraseña restablecida exitosamente'
            ];

        } catch (Exception $e) {
            error_log($e->getMessage());
            return [
                'success' => false,
                'message' => 'Error interno del servidor'
            ];
        }
    }

    public function ValidateResetToken($token)
    {
        try {
            $sql = "SELECT user_id FROM password_resets 
                    WHERE token = ? AND expires_at > NOW() AND used = FALSE";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array($token));
            $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'success' => $tokenData !== false,
                'message' => $tokenData ? 'Token válido' : 'Token inválido o expirado'
            ];

        } catch (Exception $e) {
            error_log($e->getMessage());
            return [
                'success' => false,
                'message' => 'Error interno del servidor'
            ];
        }
    }
}