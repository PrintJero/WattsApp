const express = require("express");
const router = express.Router();
const dispositivosController = require("../controllers/dispositivosController");

/**
 * @swagger
 * tags:
 *   - name: Dispositivos
 *     description: API para la gestión de dispositivos eléctricos registrados por los usuarios
 */

/**
 * @swagger
 * /api/dispositivos:
 *   get:
 *     summary: Obtener todos los dispositivos
 *     description: Devuelve una lista de todos los dispositivos registrados, junto con el usuario asociado.
 *     tags: [Dispositivos]
 *     responses:
 *       200:
 *         description: Dispositivos obtenidos correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id_dispositivo: 1
 *                   nombre_dispositivo: "Medidor Cocina"
 *                   numero_serie: "SN12345"
 *                   ubicacion: "Cocina"
 *                   descripcion: "Monitoreo de consumo en la cocina"
 *                   id_usuario: 2
 *       500:
 *         description: Error del servidor.
 */
router.get("/", dispositivosController.getAllDispositivos);

/**
 * @swagger
 * /api/dispositivos/usuario/{id_usuario}:
 *   get:
 *     summary: Obtener dispositivos por usuario
 *     description: Retorna todos los dispositivos asociados a un usuario específico.
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Dispositivos del usuario obtenidos correctamente.
 *       404:
 *         description: No se encontraron dispositivos para el usuario.
 *       500:
 *         description: Error del servidor.
 */
router.get("/usuario/:id_usuario", dispositivosController.getDispositivosByUsuario);

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   get:
 *     summary: Obtener un dispositivo por su ID
 *     description: Devuelve la información detallada de un dispositivo específico.
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dispositivo.
 *     responses:
 *       200:
 *         description: Dispositivo obtenido correctamente.
 *       404:
 *         description: Dispositivo no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.get("/:id", dispositivosController.getDispositivoById);

/**
 * @swagger
 * /api/dispositivos:
 *   post:
 *     summary: Crear un nuevo dispositivo
 *     description: Registra un nuevo dispositivo asociado a un usuario.
 *     tags: [Dispositivos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_dispositivo
 *               - numero_serie
 *               - id_usuario
 *             properties:
 *               nombre_dispositivo:
 *                 type: string
 *                 example: "Medidor Sala"
 *               numero_serie:
 *                 type: string
 *                 example: "SN98765"
 *               ubicacion:
 *                 type: string
 *                 example: "Sala principal"
 *               descripcion:
 *                 type: string
 *                 example: "Sensor conectado a toma principal"
 *               id_usuario:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Dispositivo creado correctamente.
 *       400:
 *         description: Datos incompletos o duplicados.
 *       500:
 *         description: Error del servidor.
 */
router.post("/", dispositivosController.createDispositivo);

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   put:
 *     summary: Actualizar un dispositivo
 *     description: Permite modificar los datos de un dispositivo existente.
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del dispositivo a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_dispositivo:
 *                 type: string
 *                 example: "Sensor de Corriente"
 *               numero_serie:
 *                 type: string
 *                 example: "SN654321"
 *               ubicacion:
 *                 type: string
 *                 example: "Patio"
 *               descripcion:
 *                 type: string
 *                 example: "Reubicado al área exterior"
 *     responses:
 *       200:
 *         description: Dispositivo actualizado correctamente.
 *       404:
 *         description: Dispositivo no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.put("/:id", dispositivosController.updateDispositivo);

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   delete:
 *     summary: Eliminar un dispositivo
 *     description: Elimina un dispositivo del sistema mediante su ID.
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del dispositivo a eliminar.
 *     responses:
 *       200:
 *         description: Dispositivo eliminado correctamente.
 *       404:
 *         description: Dispositivo no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.delete("/:id", dispositivosController.deleteDispositivo);

module.exports = router;