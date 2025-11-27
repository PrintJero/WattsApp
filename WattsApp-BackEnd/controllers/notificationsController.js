const bd = require('../config/bd');

// Cache para saber si la columna hidden existe
let hasHiddenColumn = null;
async function detectHiddenColumn() {
  if (hasHiddenColumn !== null) return hasHiddenColumn;
  try {
    const [rows] = await bd.query("SHOW COLUMNS FROM notifications LIKE 'hidden'");
    hasHiddenColumn = Array.isArray(rows) && rows.length > 0;
  } catch (e) {
    hasHiddenColumn = false;
  }
  return hasHiddenColumn;
}

const getNotifications = async (req, res) => {
  try {
    const { user_id, only_unread } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: 'user_id es requerido' });
    const params = [user_id];

    const hasHidden = await detectHiddenColumn();
    let sql = hasHidden
      ? 'SELECT * FROM notifications WHERE id_usuario = ? AND (hidden IS NULL OR hidden = 0)'
      : 'SELECT * FROM notifications WHERE id_usuario = ?';

    if (only_unread === '1' || only_unread === 'true') {
      sql += ' AND is_read = 0';
    }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await bd.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones', error: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { id_usuario, id_dispositivo, type, title, body, data } = req.body;
    if (!id_usuario || !type || !title) {
      return res.status(400).json({ success: false, message: 'id_usuario, type y title son obligatorios' });
    }

    const [result] = await bd.query(
      `INSERT INTO notifications (id_usuario, id_dispositivo, type, title, body, data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_usuario, id_dispositivo || null, type, title, body || null, data ? JSON.stringify(data) : null]
    );

    res.status(201).json({ success: true, data: { id_notification: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear notificación', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await bd.query('UPDATE notifications SET is_read = 1 WHERE id_notification = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar notificación', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const hasHidden = await detectHiddenColumn();

    if (hasHidden) {
      const [result] = await bd.query('UPDATE notifications SET hidden = 1 WHERE id_notification = ?', [id]);
      if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
      return res.json({ success: true, message: 'Notificación ocultada correctamente' });
    } else {
      const [result2] = await bd.query('DELETE FROM notifications WHERE id_notification = ?', [id]);
      if (!result2.affectedRows) return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
      return res.json({ success: true, message: 'Notificación eliminada (fallback)' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al ocultar notificación', error: error.message });
  }
};

module.exports = { getNotifications, createNotification, markAsRead, deleteNotification };
