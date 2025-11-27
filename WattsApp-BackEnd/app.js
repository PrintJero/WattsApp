require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dispositivosRoutes = require("./routes/dispositivosRoutes");
const medicionesRoutes = require("./routes/medicionesRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const authRoutes = require("./routes/authRoutes");

const { swaggerUi, swaggerSpec } = require("./swagger");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ping básico
app.get("/", (req, res) => {
  res.json({ success: true, message: "API WattsApp funcionando" });
});

// Rutas principales
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dispositivos", dispositivosRoutes);
app.use("/api/mediciones", medicionesRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// Errores generales
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

app.listen(port, () => console.log("Servidor desde puerto " + port));
