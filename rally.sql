-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS rally_fotografico;
USE rally_fotografico;

-- 2. Tabla 'users' (participantes y administradores)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Guardar con bcrypt
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'participant') DEFAULT 'participant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla 'photos' (fotos subidas por usuarios)
CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,  -- Ej: 'uploads/user1/foto.jpg'
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabla 'votes' (registro de votos de usuarios a fotos)
CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    photo_id INT NOT NULL,
    vote_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, photo_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
);

-- 5. Triggers para mantener actualizado el contador de votos

DELIMITER //

CREATE TRIGGER trg_increment_votes_count
AFTER INSERT ON votes
FOR EACH ROW
BEGIN
    UPDATE photos
    SET votes_count = votes_count + 1
    WHERE id = NEW.photo_id;
END //

CREATE TRIGGER trg_decrement_votes_count
AFTER DELETE ON votes
FOR EACH ROW
BEGIN
    UPDATE photos
    SET votes_count = votes_count - 1
    WHERE id = OLD.photo_id;
END //

DELIMITER ;

-- 6. Tabla 'settings' (configuración del rally)
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    max_photos_per_user INT DEFAULT 3,
    upload_start_date DATETIME,
    upload_end_date DATETIME,
    voting_start_date DATETIME,
    voting_end_date DATETIME
);

-- 7. Insertar configuración inicial
INSERT INTO settings (max_photos_per_user, upload_start_date, upload_end_date, voting_start_date, voting_end_date)
VALUES (3, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY));

-- 8. Insertar un admin por defecto (contraseña: 'password')
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@rally.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Administrador',
    'admin'
);

-- 9. Tabla 'password_resets' (tokens para recuperar contraseñas)
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_password_resets_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);
