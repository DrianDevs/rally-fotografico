# Backend - Rally Fotográfico

## Instalación de dependencias

Para instalar las dependencias de PHP necesarias, ejecuta:

```bash
composer install
```

## Dependencias principales

- **firebase/php-jwt**: Para manejo de tokens JWT de autenticación
- **resend/resend-php**: Para envío de emails de recuperación de contraseña
- **guzzlehttp/guzzle**: Cliente HTTP para peticiones

## Configuración

1. Copia `config.php.example` a `config.php` (si existe)
2. Configura los parámetros de base de datos y API keys
3. Asegúrate de que la carpeta `uploads/` tenga permisos de escritura

## Estructura

- `src/`: Archivos PHP principales de la API
- `uploads/`: Carpeta para almacenar las imágenes subidas
- `logs/`: Logs de errores de PHP
