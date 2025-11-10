const bd = require("../config/bd");

const getAllUsuarios = async (req, res) => {
  try {
    const [usuarios] = await bd.query("SELECT * FROM usuarios");
    res.json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener usuarios", error: error.message });
  }
};

module.exports = { getAllUsuarios };