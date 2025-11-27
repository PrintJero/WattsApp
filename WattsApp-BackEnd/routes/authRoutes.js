const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticación y login de usuarios
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica a un usuario mediante correo y contraseña, devuelve token u objeto de sesión.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contraseña
 *             properties:
 *               correo:
 *                 type: string
 *                 example: 'usuario@example.com'
 *               contraseña:
 *                 type: string
 *                 example: 'secret123'
 *     responses:
 *       200:
 *         description: Autenticación correcta.
 *       400:
 *         description: Parámetros inválidos.
 *       401:
 *         description: Credenciales incorrectas.
 *       500:
 *         description: Error del servidor.
 */
router.post('/login', authController.login);

module.exports = router;
