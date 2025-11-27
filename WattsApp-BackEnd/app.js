require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dispositivosRoutes = require("./routes/dispositivosRoutes");
const medicionesRoutes = require("./routes/medicionesRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");

const { swaggerUi, swaggerSpec } = require("./swagger");
const bd = require('./config/bd');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "API WattsApp funcionando" });
});
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dispositivos", dispositivosRoutes);
app.use("/api/mediciones", medicionesRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({
      success: false,
      message: "Error interno del servidor",
      error: err.message,
    });
});

// Ensure DB schema for notifications and device columns exists
const ensureSchema = async () => {
  try {
    // Create notifications table if not exists
    await bd.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id_notification INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_dispositivo INT DEFAULT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        data JSON DEFAULT NULL,
        is_read TINYINT(1) DEFAULT 0,
        hidden TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await bd.query(`ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS is_online TINYINT(1) DEFAULT 0`);
      await bd.query(`ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS ultimo_estado DATETIME DEFAULT NULL`);
      await bd.query(`ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS threshold_w DECIMAL(10,3) DEFAULT NULL`);
      // Asegurarse de que 'hidden' exista en la tabla notifications para BD antiguas
      try {
        await bd.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS hidden TINYINT(1) DEFAULT 0`);
      } catch (e2) {
        // ignorar si no está soportado
      }
    } catch (e) {
      console.warn('Warning: could not run ALTER TABLE with IF NOT EXISTS - your MySQL version may not support it.');
    }

    try {
      await bd.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(id_usuario, is_read)`);
    } catch (e) {
    }

    console.log('DB schema check complete');
  } catch (err) {
    console.error('Error ensuring DB schema:', err.message);
  }
};

ensureSchema().then(() => {
  app.listen(port, () => console.log("Servidor desde puerto " + port));
  const DISCONNECT_TIMEOUT_SECONDS = Number(process.env.DISCONNECT_TIMEOUT_SECONDS || 60);
  const CHECK_INTERVAL_MS = Number(process.env.DISCONNECT_CHECK_INTERVAL_MS || 30000);

  setInterval(async () => {
    try {
      // Encontrar dispositivos marcados como online cuya 'ultimo_estado' es anterior al timeout
      const [rows] = await bd.query(
        `SELECT id_dispositivo, nombre_dispositivo, id_usuario, ultimo_estado
         FROM dispositivos
         WHERE is_online = 1 AND (ultimo_estado IS NULL OR ultimo_estado < FROM_UNIXTIME(UNIX_TIMESTAMP() - ?))`,
        [DISCONNECT_TIMEOUT_SECONDS]
      );

      for (const device of rows) {
        try {
          // Marcar dispositivo como offline
          await bd.query('UPDATE dispositivos SET is_online = 0 WHERE id_dispositivo = ?', [device.id_dispositivo]);
          const title = 'Dispositivo desconectado';
          const body = `${device.nombre_dispositivo} no reporta desde hace más de ${DISCONNECT_TIMEOUT_SECONDS} s`;
          await bd.query(
            `INSERT INTO notifications (id_usuario, id_dispositivo, type, title, body, data)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [device.id_usuario, device.id_dispositivo, 'disconnect', title, body, JSON.stringify({ last_seen: device.ultimo_estado, timeout_s: DISCONNECT_TIMEOUT_SECONDS })]
          );
          console.log('[notifications] inserted disconnect for device', device.id_dispositivo);
        } catch (err) {
          console.error('Error handling device disconnect for', device.id_dispositivo, err.message);
        }
      }
    } catch (err) {
      console.error('Error checking device disconnects:', err.message);
    }
  }, CHECK_INTERVAL_MS);

}).catch((err) => {
  console.error('Failed to ensure schema, starting server anyway:', err);
  app.listen(port, () => console.log("Servidor desde puerto " + port));
});
