const bd = require("../config/bd");

const getAllDispositivos = async (req, res) => {
  try {
    const [rows] = await bd.query(`
      SELECT d.*, u.nombre AS nombre_usuario, u.correo
      FROM dispositivos d
      LEFT JOIN usuarios u ON d.id_usuario = u.id_usuario
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener dispositivos", error: error.message });
  }
};

const getDispositivosByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [rows] = await bd.query(
      "SELECT * FROM dispositivos WHERE id_usuario = ?",
      [id_usuario]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener los dispositivos", error: error.message });
  }
};

const getDispositivoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await bd.query(
      "SELECT * FROM dispositivos WHERE id_dispositivo = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Dispositivo no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener el dispositivo", error: error.message });
  }
};

const createDispositivo = async (req, res) => {
  try {
    const { nombre_dispositivo, numero_serie, ubicacion, descripcion, id_usuario } = req.body;

    if (!nombre_dispositivo || !numero_serie || !id_usuario) {
      return res.status(400).json({
        success: false,
        message: "nombre_dispositivo, numero_serie e id_usuario son obligatorios"
      });
    }

    const [result] = await bd.query(
      `INSERT INTO dispositivos (nombre_dispositivo, numero_serie, ubicacion, descripcion, id_usuario)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre_dispositivo, numero_serie, ubicacion || null, descripcion || null, id_usuario]
    );

    res.status(201).json({
      success: true,
      data: {
        id_dispositivo: result.insertId,
        nombre_dispositivo,
        numero_serie,
        ubicacion,
        descripcion,
        id_usuario
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "El número de serie ya está registrado" });
    }
    res.status(500).json({ success: false, message: "Error al crear dispositivo", error: error.message });
  }
};

const updateDispositivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_dispositivo, numero_serie, ubicacion, descripcion, is_online } = req.body;

    // Obtener estado previo para detectar cambios en is_online
    const [existingRows] = await bd.query(
      "SELECT * FROM dispositivos WHERE id_dispositivo = ?",
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({ success: false, message: "Dispositivo no encontrado" });
    }

    const existing = existingRows[0];

    const [result] = await bd.query(
      `UPDATE dispositivos
       SET nombre_dispositivo = ?, numero_serie = ?, ubicacion = ?, descripcion = ?, is_online = ?, ultimo_estado = NOW()
       WHERE id_dispositivo = ?`,
      [nombre_dispositivo || existing.nombre_dispositivo, numero_serie || existing.numero_serie, ubicacion || existing.ubicacion, descripcion || existing.descripcion, typeof is_online === 'undefined' ? existing.is_online : is_online, id]
    );

    if (!result.affectedRows) {
      return res.status(500).json({ success: false, message: "No se pudo actualizar el dispositivo" });
    }

    // Si cambió el estado de conexión, crear notificación
    if (typeof is_online !== 'undefined' && Number(is_online) !== Number(existing.is_online)) {
      const notificationType = is_online ? 'connect' : 'disconnect';
      const title = is_online ? 'Dispositivo conectado' : 'Dispositivo desconectado';
      const body = `${existing.nombre_dispositivo} ha ${is_online ? 'conectado' : 'desconectado'}`;
      try {
        await bd.query(
          `INSERT INTO notifications (id_usuario, id_dispositivo, type, title, body, data)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [existing.id_usuario, id, notificationType, title, body, JSON.stringify({ prev: existing.is_online, now: is_online })]
        );
      } catch (err) {
        console.error('Error creando notificación:', err.message);
      }
    }

    res.json({ success: true, message: "Dispositivo actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar dispositivo", error: error.message });
  }
};

const deleteDispositivo = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await bd.query(
      "DELETE FROM dispositivos WHERE id_dispositivo = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Dispositivo no encontrado" });
    }

    res.json({ success: true, message: "Dispositivo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar dispositivo", error: error.message });
  }
};

module.exports = {
  getAllDispositivos,
  getDispositivosByUsuario,
  getDispositivoById,
  createDispositivo,
  updateDispositivo,
  deleteDispositivo
};