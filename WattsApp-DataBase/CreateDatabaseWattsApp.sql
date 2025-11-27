DROP DATABASE IF EXISTS WattsApp;
CREATE DATABASE WattsApp;
USE WattsApp;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(150) UNIQUE,
    contraseña VARCHAR(255),
    fecha_registro DATETIME DEFAULT NOW()
);

CREATE TABLE dispositivos (
    id_dispositivo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_dispositivo VARCHAR(100),
    numero_serie VARCHAR(50) UNIQUE,
    ubicacion VARCHAR(100),
    descripcion VARCHAR(255),
    id_usuario INT,
    is_online TINYINT(1) DEFAULT 0,
    ultimo_estado DATETIME DEFAULT NULL,
    fecha_registro DATETIME DEFAULT NOW(),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE mediciones (
    id_medicion INT AUTO_INCREMENT PRIMARY KEY,
    id_dispositivo INT,
    corriente DECIMAL(10,3),
    voltaje DECIMAL(10,3),
    potencia DECIMAL(10,3),
    fecha_hora DATETIME DEFAULT NOW(),
    FOREIGN KEY (id_dispositivo) REFERENCES dispositivos(id_dispositivo)
);

CREATE TABLE notifications (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_dispositivo INT DEFAULT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSON DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    hidden TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_dispositivo) REFERENCES dispositivos(id_dispositivo)
);

CREATE INDEX idx_notifications_user_read ON notifications(id_usuario, is_read);

ALTER TABLE dispositivos ADD COLUMN threshold_w DECIMAL(10,3) DEFAULT NULL;

UPDATE dispositivos SET threshold_w = 150 WHERE id_dispositivo = 1;