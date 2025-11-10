const express = require("express");
const router = express.Router();
const medicionesController = require("../controllers/medicionesController");

/**
 * @swagger
 * tags:
 *   - name: Mediciones
 *     description: API para la gestión de mediciones eléctricas
 */

/**
 * @swagger
 * /api/mediciones/usuario/{idUsuario}:
 *   get:
 *     summary: Obtener las mediciones de todos los dispositivos de un usuario
 *     tags: [Mediciones]
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Mediciones obtenidas correctamente
 *       404:
 *         description: No se encontraron mediciones
 */
router.get("/usuario/:idUsuario", medicionesController.getMedicionesByUsuario);

/**
 * @swagger
 * /api/mediciones/dispositivo/{id_dispositivo}:
 *   get:
 *     summary: Obtener las mediciones de un dispositivo específico
 *     tags: [Mediciones]
 *     parameters:
 *       - in: path
 *         name: id_dispositivo
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dispositivo
 *     responses:
 *       200:
 *         description: Mediciones del dispositivo obtenidas correctamente
 *       404:
 *         description: Dispositivo no encontrado o sin mediciones
 */
router.get("/dispositivo/:id_dispositivo", medicionesController.getMedicionesByDispositivo);

module.exports = router;
