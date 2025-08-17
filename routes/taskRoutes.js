const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Роуты для заданий
router.post('/create', taskController.createTask);
router.post('/', taskController.getTasksForPlayer);
router.post('/list', taskController.getAllTasks);
router.post('/accept', taskController.acceptTask);
router.post('/complete', taskController.completeTask);
router.post('/delete', taskController.deleteTask);
router.post('/change-performer', taskController.changePerformer);

module.exports = router;