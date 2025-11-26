const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/login
 * Body: { correo, contraseña }
 */
router.post('/login', authController.login);

module.exports = router;
