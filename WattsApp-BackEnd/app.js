require('dotenv').config();
const express = require('express');
const cors = require('cors');

const dispositivosRoutes = require('./routes/dispositivosRoutes');
const medicionesRoutes   = require('./routes/medicionesRoutes');

const { swaggerUi, swaggerSpec } = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/mediciones',   medicionesRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404
app.use((req,res)=> res.status(404).json({ success:false, message:'ruta no encontrada' }));

// Errores
app.use((err,req,res,next)=>{
  console.error(err.stack);
  res.status(500).json({ success:false, message:'Error interno', error: err.message });
});

app.listen(port, () => console.log('Servidor desde puerto ' + port));
