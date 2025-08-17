const Vaccine = require('../models/Vaccine');
const User = require('../models/User'); // Предполагается, что модель User существует

exports.createVaccine = async (req, res) => {
    const { name, diseaseName, dosage, effectiveness, sideEffects } = req.body;
    if (!name || !diseaseName || !dosage || effectiveness === undefined) {
        return res.status(400).json({ message: 'Заполните все обязательные поля.' });
    }
    try {
        const newVaccine = new Vaccine({
            name,
            diseaseName,
            dosage,
            effectiveness,
            sideEffects
        });
        await newVaccine.save();
        res.status(201).json({ message: 'Вакцина успешно создана!' });
    } catch (error) {
        console.error('Ошибка при создании вакцины:', error);
        res.status(500).json({ message: 'Ошибка при создании вакцины' });
    }
};

exports.getVaccineInfo = async (req, res) => {
    const { name } = req.body;
    try {
        const vaccine = await Vaccine.findOne({ name: name });
        if (!vaccine) {
            return res.status(404).json({ message: 'Вакцина не найдена.' });
        }
        res.status(200).json(vaccine);
    } catch (error) {
        console.error('Ошибка при получении информации о вакцине:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
};