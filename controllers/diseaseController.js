const Disease = require('../models/Disease');
const User = require('../models/User'); // Предполагается, что модель User существует

exports.createDisease = async (req, res) => {
    const { name, type, symptoms, spread, resistance, vulnerabilities, treatment, vaccine } = req.body;

    // Проверка обязательного поля 'name'
    if (!name) {
        return res.status(400).json({ message: 'Поле "name" является обязательным.' });
    }

    try {
        const newDisease = new Disease({
            name: name,
            type: type || 'Неизвестно',
            symptoms: symptoms || 'Неизвестно',
            spread: spread || 'Неизвестно',
            resistance: resistance || 'Неизвестно',
            vulnerabilities: vulnerabilities || 'Неизвестно',
            treatment: treatment || 'Неизвестно',
            vaccine: vaccine || 'Нет'
        });
        await newDisease.save();
        res.status(201).json({ message: 'Болезнь успешно создана!' });
    } catch (error) {
        console.error('Ошибка при создании болезни:', error);
        res.status(500).json({ message: 'Ошибка при создании болезни' });
    }
};

exports.getDiseasesList = async (req, res) => {
    try {
        const diseases = await Disease.find({});
        res.status(200).json(diseases);
    } catch (error) {
        console.error('Ошибка при получении списка болезней:', error);
        res.status(500).json({ message: 'Ошибка при получении списка болезней' });
    }
};

exports.deleteDisease = async (req, res) => {
    const { diseaseId, requesterUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        await Disease.deleteOne({ _id: diseaseId });
        res.status(200).json({ message: 'Болезнь успешно удалена.' });
    } catch (error) {
        console.error('Ошибка при удалении болезни:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
};