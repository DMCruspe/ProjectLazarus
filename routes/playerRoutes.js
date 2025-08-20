const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { requireAdmin, requireSuperadmin } = require('../middleware/authMiddleware');

// Роуты для игроков

// Существующие роуты
router.post('/', playerController.getPlayers);
router.post('/add-credits', playerController.addCredits);
router.post('/update-credits', playerController.updatePlayerCredits);
router.post('/toggle-role', playerController.togglePlayerRole);
router.post('/delete', playerController.deletePlayer);

// НОВЫЙ маршрут для получения списка неавторизованных игроков
router.post('/unauthorized-players', playerController.getUnauthorizedPlayers);

module.exports = router;