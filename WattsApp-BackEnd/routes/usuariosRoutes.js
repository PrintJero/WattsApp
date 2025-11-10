const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: API para la gestión de usuarios en el sistema WattsApp
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna un listado con todos los usuarios registrados en el sistema.
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id_usuario: 1
 *                   nombre: "Juan Pérez"
 *                   correo: "juan@example.com"
 *                   fecha_registro: "2025-11-10"
 *       500:
 *         description: Error del servidor.
 */
router.get("/", usuariosController.getAllUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por su ID
 *     description: Devuelve la información de un usuario específico.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a consultar.
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id_usuario: 2
 *                 nombre: "María López"
 *                 correo: "maria@example.com"
 *                 fecha_registro: "2025-10-20"
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.get("/:id", usuariosController.getUsuarioById);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     description: Registra un nuevo usuario en el sistema.
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - contraseña
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Carlos Ruiz"
 *               correo:
 *                 type: string
 *                 example: "carlos@example.com"
 *               contraseña:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id_usuario: 5
 *                 nombre: "Carlos Ruiz"
 *                 correo: "carlos@example.com"
 *       400:
 *         description: Datos incompletos o duplicados.
 *       500:
 *         description: Error del servidor.
 */
router.post("/", usuariosController.createUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     description: Modifica los datos de un usuario existente.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Carlos Ramírez"
 *               correo:
 *                 type: string
 *                 example: "carlosr@example.com"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.put("/:id", usuariosController.updateUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Elimina un usuario del sistema por su ID.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.delete("/:id", usuariosController.deleteUsuario);

module.exports = router;