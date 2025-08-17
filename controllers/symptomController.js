const Symptom = require('../models/Symptom');
const User = require('../models/User'); // Предполагается, что модель User существует

exports.addSymptom = async (req, res) => {
    const { name, subgroup } = req.body;
    if (!name || !subgroup) {
        return res.status(400).json({ message: 'Заполните все поля.' });
    }
    try {
        const newSymptom = new Symptom({ name, subgroup });
        await newSymptom.save();
        res.status(201).json({ message: 'Симптом успешно добавлен!' });
    } catch (error) {
        console.error('Ошибка при добавлении симптома:', error);
        res.status(500).json({ message: 'Ошибка при добавлении симптома' });
    }
};

exports.deleteSymptom = async (req, res) => {
    const { id } = req.body;
    try {
        await Symptom.findByIdAndDelete(id);
        res.status(200).json({ message: 'Симптом успешно удален.' });
    } catch (error) {
        console.error('Ошибка при удалении симптома:', error);
        res.status(500).json({ message: 'Ошибка при удалении симптома' });
    }
};

exports.getSymptomsList = async (req, res) => {
    try {
        const symptoms = await Symptom.find({});
        res.status(200).json(symptoms);
    } catch (error) {
        console.error('Ошибка при получении списка симптомов:', error);
        res.status(500).json({ message: 'Ошибка при получении списка симптомов' });
    }
};