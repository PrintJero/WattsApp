const mysql = require('mysql2');
require('dotenv').config(); // archivo de configutración creada

// Crear pool de conexiones <- mejora el rendimiento
const pooldb = mysql.createPool({
    host: process.env.BD_HOST,
    user: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_NAME,
    port: process.env.BD_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convertir a promesas para usar async/await
const promisePoolDB = pooldb.promise();

// Probar la conexión
pooldb.getConnection((error, connection)=>{
    if(error) {
        console.error('Error conectando a la base de datos: ', error.message);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
    connection.release();
});

module.exports = promisePoolDB;