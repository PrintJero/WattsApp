const bd = require("../config/bd");

const getDispositivosByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [dispositivos] = await bd.query(
      "SELECT * FROM dispositivos WHERE id_usuario = ?",
      [id_usuario]
    );

    res.json({ success: true, data: dispositivos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener los dispositivos", error: error.message });
  }
};

const getDispositivoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [dispositivo] = await bd.query(
      "SELECT * FROM dispositivos WHERE id_dispositivo = ?",
      [id]
    );

    if (dispositivo.length === 0) {
      return res.status(404).json({ success: false, message: "Dispositivo no encontrado" });
    }

    res.json({ success: true, data: dispositivo[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener el dispositivo", error: error.message });
  }
};

module.exports = { getDispositivosByUsuario, getDispositivoById };
