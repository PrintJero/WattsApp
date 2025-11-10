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
    id_usuario INT,
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
