const bd = require('../config/bd');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    if (!correo || !contraseña) return res.status(400).json({ success: false, message: 'correo y contraseña son requeridos' });

    const [rows] = await bd.query('SELECT id_usuario, nombre, correo, contraseña FROM usuarios WHERE correo = ?', [correo]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const user = rows[0];
    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const { id_usuario, nombre } = user;
    res.json({ success: true, data: { id_usuario, nombre, correo } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al autenticar', error: error.message });
  }
};

module.exports = { login };
