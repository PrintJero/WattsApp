const bd = require('../config/bd');

const getNotifications = async (req, res) => {
  try {
    const { user_id, only_unread } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: 'user_id es requerido' });
    // Intentamos primero filtrar por la columna 'hidden'. Si la columna no existe, volvemos a una consulta sin ese filtro.
    const params = [user_id];
    try {
      let sql = 'SELECT * FROM notifications WHERE id_usuario = ? AND (hidden IS NULL OR hidden = 0)';
      if (only_unread === '1' || only_unread === 'true') {
        sql += ' AND is_read = 0';
      }
      sql += ' ORDER BY created_at DESC';
      const [rows] = await bd.query(sql, params);
      return res.json({ success: true, data: rows });
    } catch (err) {
      // Si falla (por ejemplo porque la columna `hidden` no existe), usar una consulta sin ese filtro
      console.warn('getNotifications: consulta primaria falló, usando fallback sin filtro hidden:', err.message);
      let sql2 = 'SELECT * FROM notifications WHERE id_usuario = ?';
      if (only_unread === '1' || only_unread === 'true') {
        sql2 += ' AND is_read = 0';
      }
      sql2 += ' ORDER BY created_at DESC';
      const [rows2] = await bd.query(sql2, params);
      return res.json({ success: true, data: rows2 });
    }
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
    // Intentar ocultar (soft-hide) usando la columna `hidden`. Si falla (columna ausente), usar DELETE como fallback.
    try {
      const [result] = await bd.query('UPDATE notifications SET hidden = 1 WHERE id_notification = ?', [id]);
      if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
      return res.json({ success: true, message: 'Notificación ocultada correctamente' });
    } catch (err) {
      console.warn('deleteNotification: soft-hide failed, falling back to hard delete:', err.message);
      const [result2] = await bd.query('DELETE FROM notifications WHERE id_notification = ?', [id]);
      if (!result2.affectedRows) return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
      return res.json({ success: true, message: 'Notificación eliminada (fallback)' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al ocultar notificación', error: error.message });
  }
};

module.exports = { getNotifications, createNotification, markAsRead, deleteNotification };
