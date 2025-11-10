const express = require("express");
const router = express.Router();
const dispositivosController = require("../controllers/dispositivosController");

/**
 * @swagger
 * tags:
 *   - name: Dispositivos
 *     description: API para la gestión de dispositivos
 */

/**
 * @swagger
 * /api/dispositivos/usuario/{idUsuario}:
 *   get:
 *     summary: Obtener los dispositivos registrados por un usuario
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de dispositivos del usuario
 *       404:
 *         description: Usuario no encontrado o sin dispositivos
 */
router.get("/usuario/:idUsuario", dispositivosController.getDispositivosByUsuario);

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   get:
 *     summary: Obtener un dispositivo por su ID
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dispositivo
 *     responses:
 *       200:
 *         description: Dispositivo encontrado
 *       404:
 *         description: Dispositivo no encontrado
 */
router.get("/:id", dispositivosController.getDispositivoById);

module.exports = router;