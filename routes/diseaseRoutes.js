const express = require('express');
const router = express.Router();
const diseaseController = require('../controllers/diseaseController');

// Публичный маршрут для получения всех болезней. 
// Доступен без авторизации. Использует GET-метод, чтобы соответствовать RESTful-практикам.
router.get('/list-public', diseaseController.listPublicDiseases);

// Приватный маршрут для удаления болезни. 
// Требует авторизации и прав администратора.
router.post('/delete', diseaseController.deleteDisease);

// Маршрут для создания новой болезни. 
// Требует авторизации и, возможно, прав администратора.
router.post('/create', diseaseController.createDisease);

// Маршрут для получения информации о вакцине. 
// Предположительно, публичный.
router.post('/vaccine/info', diseaseController.getVaccineInfo);

module.exports = router;