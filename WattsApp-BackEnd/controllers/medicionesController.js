const bd = require("../config/bd");

const getMedicionesByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [mediciones] = await bd.query(
      `
      SELECT 
        m.id_medicion,
        m.id_dispositivo,
        d.nombre_dispositivo,
        m.corriente,
        m.voltaje,
        m.potencia,
        m.fecha_hora
      FROM mediciones m
      INNER JOIN dispositivos d ON m.id_dispositivo = d.id_dispositivo
      WHERE d.id_usuario = ?
      ORDER BY m.fecha_hora DESC;
    `,
      [id_usuario]
    );

    res.json({ success: true, data: mediciones });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las mediciones",
      error: error.message,
    });
  }
};

const getMedicionesByDispositivo = async (req, res) => {
  try {
    const { id_dispositivo } = req.params;

    const [mediciones] = await bd.query(
      `
      SELECT * FROM mediciones
      WHERE id_dispositivo = ?
      ORDER BY fecha_hora DESC
    `,
      [id_dispositivo]
    );

    res.json({ success: true, data: mediciones });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las mediciones",
      error: error.message,
    });
  }
};

const createMedicion = async (req, res) => {
  try {
    const { id_dispositivo, corriente, voltaje, potencia } = req.body;

    if (
      !id_dispositivo ||
      corriente == null ||
      voltaje == null ||
      potencia == null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "id_dispositivo, corriente, voltaje y potencia son obligatorios",
      });
    }

    const [result] = await bd.query(
      `INSERT INTO mediciones (id_dispositivo, corriente, voltaje, potencia)
       VALUES (?, ?, ?, ?)`,
      [id_dispositivo, corriente, voltaje, potencia]
    );

    res.status(201).json({
      success: true,
      data: {
        id_medicion: result.insertId,
        id_dispositivo,
        corriente,
        voltaje,
        potencia,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear medición",
      error: error.message,
    });
  }
};

module.exports = {
  getMedicionesByUsuario,
  getMedicionesByDispositivo,
  createMedicion,
};