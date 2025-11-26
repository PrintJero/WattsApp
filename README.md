# WattsApp – Proyecto Segundo Parcial

Aplicación Full Stack desarrollada para monitorear y gestionar dispositivos eléctricos, mostrando mediciones en tiempo real y optimizando el consumo energético.  
El proyecto está dividido en **Backend (Node.js + Express + MySQL)** y **Frontend (React Native con Expo)**.

---

## Instrucciones de instalación y ejecución

### 1. Clonar el repositorio
git clone https://github.com/tu-usuario/wattsapp.git
cd wattsapp

### 2. Configurar el Backend

#### Entrar a la carpeta del backend:
cd WattsApp-BackEnd

#### Instalar dependencias:
npm install

#### Crear el archivo .env en la raíz del backend con los siguientes valores:
PORT=3000

DB_HOST=localhost

DB_USER=root

DB_PASSWORD=tu_contraseña

DB_NAME=wattsapp

#### Ejecutar el servidor:
npx nodemon app.js


##### Abrir en el navegador:
http://localhost:3000/api-docs

(Swagger UI con toda la documentación del API)


### 3. Configurar el Frontend (Expo)

### En otra terminal, entrar al frontend:
cd WattsApp-FrontEnd

### Instalar dependencias:
npm install


### Iniciar la app:
npx expo start
Escanear el QR o abrir en el emulador Android/iOS.

## Integrantes del equipo

Francisco Garcia

Julian Gonzalez

Jeronimo Galvez

## Descripción breve del módulo implementado

El módulo desarrollado por Francisco García (Pancho) consiste en la implementación completa del Frontend móvil usando Expo y React Native, conectado al Backend mediante llamadas REST API.

### Funcionalidades principales:
- Pantalla Splash con branding y navegación automática.
- Menú principal con opciones para “Mis dispositivos” y “Mediciones”.
#### Módulo de Dispositivos:
- Visualiza los dispositivos registrados (GET).
- Permite agregar, editar o eliminar (POST / PUT / DELETE).
- Datos sincronizados con la base de datos MySQL.
- Interfaz limpia y responsive con colores oscuros y estilo moderno.
- Integración completa con Swagger y la API REST del backend.
