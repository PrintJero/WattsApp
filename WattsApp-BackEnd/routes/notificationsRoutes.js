const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Gestión de notificaciones del sistema
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener notificaciones de un usuario
 *     description: Devuelve las notificaciones para un `user_id`. Permite filtrar sólo no leídas con `only_unread`.
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario cuyas notificaciones se solicitan.
 *       - in: query
 *         name: only_unread
 *         schema:
 *           type: string
 *         required: false
 *         description: 1 o true para filtrar sólo notificaciones no leídas.
 *     responses:
 *       200:
 *         description: Lista de notificaciones.
 *       400:
 *         description: Parámetros inválidos.
 *       500:
 *         description: Error del servidor.
 */
router.get('/', notificationsController.getNotifications);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Crear una notificación
 *     description: Inserta una nueva notificación en el sistema.
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - type
 *               - title
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               id_dispositivo:
 *                 type: integer
 *                 example: 4
 *               type:
 *                 type: string
 *                 example: 'over_threshold'
 *               title:
 *                 type: string
 *                 example: 'Prueba'
 *               body:
 *                 type: string
 *                 example: 'Detalle de la notificación'
 *               data:
 *                 type: object
 *                 example: { "potencia": 200 }
 *     responses:
 *       201:
 *         description: Notificación creada.
 *       400:
 *         description: Parámetros faltantes.
 *       500:
 *         description: Error del servidor.
 */
router.post('/', notificationsController.createNotification);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marcar notificación como leída
 *     description: Marca una notificación como leída por `id`.
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la notificación.
 *     responses:
 *       200:
 *         description: Notificación marcada como leída.
 *       404:
 *         description: Notificación no encontrada.
 *       500:
 *         description: Error del servidor.
 */
router.put('/:id/read', notificationsController.markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Eliminar u ocultar una notificación
 *     description: Oculta (soft-delete) una notificación si la columna `hidden` existe, si no realiza un DELETE.
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la notificación.
 *     responses:
 *       200:
 *         description: Notificación eliminada u ocultada correctamente.
 *       404:
 *         description: Notificación no encontrada.
 *       500:
 *         description: Error del servidor.
 */
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
