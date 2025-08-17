const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { requireAdmin, requireSuperadmin } = require('../middleware/authMiddleware'); // Предполагается, что вы создадите этот middleware

// Роуты для игроков
router.post('/', playerController.getPlayers);
router.post('/add-credits', playerController.addCredits);
router.post('/update-credits', playerController.updatePlayerCredits);
router.post('/toggle-role', playerController.togglePlayerRole);
router.post('/delete', playerController.deletePlayer);

module.exports = router;