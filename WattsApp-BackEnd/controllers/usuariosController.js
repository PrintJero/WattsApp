const bd = require("../config/bd");

// GET /api/usuarios
const getAllUsuarios = async (req, res) => {
  try {
    const [rows] = await bd.query("SELECT id_usuario, nombre, correo, fecha_registro FROM usuarios");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener usuarios", error: error.message });
  }
};

// GET /api/usuarios/:id
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await bd.query(
      "SELECT id_usuario, nombre, correo, fecha_registro FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener usuario", error: error.message });
  }
};

// POST /api/usuarios
const createUsuario = async (req, res) => {
  try {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ success: false, message: "nombre, correo y contraseña son obligatorios" });
    }

    const [result] = await bd.query(
      "INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)",
      [nombre, correo, contraseña] // aquí podrían luego hashear la contraseña
    );

    res.status(201).json({
      success: true,
      data: { id_usuario: result.insertId, nombre, correo }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "El correo ya está registrado" });
    }
    res.status(500).json({ success: false, message: "Error al crear usuario", error: error.message });
  }
};

// PUT /api/usuarios/:id
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo } = req.body;

    const [result] = await bd.query(
      "UPDATE usuarios SET nombre = ?, correo = ? WHERE id_usuario = ?",
      [nombre, correo, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar usuario", error: error.message });
  }
};

// DELETE /api/usuarios/:id
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await bd.query(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar usuario", error: error.message });
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
