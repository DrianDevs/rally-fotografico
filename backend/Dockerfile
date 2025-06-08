# Utiliza una imagen oficial de PHP con Apache
FROM php:8.1-apache

# Instala las extensiones necesarias de PHP y Composer
RUN apt-get update \
    && apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev zip unzip git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql

# Habilita mod_rewrite de Apache
RUN a2enmod rewrite

# Copia los archivos del backend al contenedor
COPY . /var/www/html/

# Establece el directorio de trabajo
WORKDIR /var/www/html

# Instala las dependencias de Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm composer-setup.php \
    && composer install --no-dev --optimize-autoloader

# Da permisos de escritura a la carpeta de uploads y logs
RUN chown -R www-data:www-data /var/www/html/uploads /var/www/html/logs || true

# Configura el DocumentRoot de Apache a 'public/'
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Expone el puerto 80
EXPOSE 80

# Render detecta automáticamente el arranque con Apache, no es necesario CMD extra 