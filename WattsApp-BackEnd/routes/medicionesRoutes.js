const express = require("express");
const router = express.Router();
const medicionesController = require("../controllers/medicionesController");

/**
 * @swagger
 * tags:
 *   - name: Mediciones
 *     description: API para la gestión y monitoreo de mediciones eléctricas en dispositivos conectados
 */

/**
 * @swagger
 * /api/mediciones/usuario/{idUsuario}:
 *   get:
 *     summary: Obtener todas las mediciones de los dispositivos de un usuario
 *     description: Retorna un listado de todas las mediciones eléctricas registradas para todos los dispositivos que pertenecen a un usuario específico.
 *     tags: [Mediciones]
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario propietario de los dispositivos.
 *     responses:
 *       200:
 *         description: Mediciones obtenidas correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id_medicion: 1
 *                   id_dispositivo: 4
 *                   corriente: 1.2
 *                   voltaje: 120
 *                   potencia: 144
 *                   fecha_medicion: "2025-11-10T14:00:00Z"
 *       404:
 *         description: No se encontraron mediciones para el usuario.
 *       500:
 *         description: Error en el servidor.
 */
router.get("/usuario/:idUsuario", medicionesController.getMedicionesByUsuario);

/**
 * @swagger
 * /api/mediciones/dispositivo/{id_dispositivo}:
 *   get:
 *     summary: Obtener las mediciones de un dispositivo específico
 *     description: Devuelve todas las mediciones eléctricas registradas en un dispositivo por su ID.
 *     tags: [Mediciones]
 *     parameters:
 *       - in: path
 *         name: id_dispositivo
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dispositivo a consultar.
 *     responses:
 *       200:
 *         description: Mediciones del dispositivo obtenidas correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id_medicion: 8
 *                   corriente: 0.8
 *                   voltaje: 115
 *                   potencia: 92
 *                   fecha_medicion: "2025-11-10T12:45:00Z"
 *       404:
 *         description: No se encontraron mediciones para este dispositivo.
 *       500:
 *         description: Error en el servidor.
 */
router.get("/dispositivo/:id_dispositivo", medicionesController.getMedicionesByDispositivo);

/**
 * @swagger
 * /api/mediciones:
 *   post:
 *     summary: Registrar una nueva medición eléctrica
 *     description: Crea un nuevo registro de medición con corriente, voltaje y potencia asociados a un dispositivo. Normalmente este endpoint será usado por un microcontrolador o un servicio de IoT.
 *     tags: [Mediciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_dispositivo
 *               - corriente
 *               - voltaje
 *               - potencia
 *             properties:
 *               id_dispositivo:
 *                 type: integer
 *                 description: ID del dispositivo que envía la medición.
 *                 example: 4
 *               corriente:
 *                 type: number
 *                 description: Corriente medida en amperios (A).
 *                 example: 1.23
 *               voltaje:
 *                 type: number
 *                 description: Voltaje medido en voltios (V).
 *                 example: 120.5
 *               potencia:
 *                 type: number
 *                 description: Potencia calculada en vatios (W).
 *                 example: 148.2
 *     responses:
 *       201:
 *         description: Medición registrada correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id_medicion: 25
 *                 id_dispositivo: 4
 *                 corriente: 1.23
 *                 voltaje: 120.5
 *                 potencia: 148.2
 *       400:
 *         description: Faltan datos obligatorios o el formato es incorrecto.
 *       500:
 *         description: Error en el servidor al registrar la medición.
 */
router.post("/", medicionesController.createMedicion);

module.exports = router;
