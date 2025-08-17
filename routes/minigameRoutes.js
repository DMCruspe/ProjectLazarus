const express = require('express');
const router = express.Router();
const minigameController = require('../controllers/minigameController');

router.get('/identify-type', minigameController.identifyType);

module.exports = router;