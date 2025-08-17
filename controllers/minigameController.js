const Disease = require('../models/Disease');
const Symptom = require('../models/Symptom');
const mongoose = require('mongoose');

exports.identifyType = async (req, res) => {
    try {
        // Данные для игры: названия болезней и соответствующие им изображения
        const gameData = [
            { name: 'Бактерия', image: 'image_e4b493.png' },
            { name: 'Вирус', image: 'image_e26b78.png' },
            { name: 'Грибок', image: 'image_e34d30.png' },
            { name: 'Паразит', image: 'image_e4adf1.png' }
        ];

        // Выбираем случайную болезнь в качестве правильного ответа
        const correctAnswerData = gameData[Math.floor(Math.random() * gameData.length)];
        const correctAnswer = correctAnswerData.name;
        const imageUrl = `/images/${correctAnswerData.image}`;

        // Выбираем три случайных ложных ответа
        const incorrectAnswers = gameData.filter(item => item.name !== correctAnswer)
                                         .sort(() => 0.5 - Math.random())
                                         .slice(0, 3)
                                         .map(item => item.name);

        // Объединяем все ответы и перемешиваем их
        const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => 0.5 - Math.random());

        // Отправляем данные клиенту
        res.json({
            imageUrl: imageUrl,
            answers: allAnswers,
            correctAnswer: correctAnswer
        });
    } catch (error) {
        console.error('Ошибка в мини-игре "Определить тип":', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере при подготовке мини-игры.' });
    }
};

exports.getSymptomsGame = async (req, res) => {
    try {
        // 1. Выбрать случайную болезнь из БД.
        const diseases = await Disease.find({});
        if (diseases.length === 0) {
            return res.status(404).json({ message: 'Болезни не найдены в базе данных.' });
        }
        const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];

        // 2. Получить правильные симптомы из выбранной болезни
        // Предполагается, что симптомы хранятся в виде строки, разделенной запятыми.
        const correctSymptoms = randomDisease.symptoms.split(',').map(s => s.trim());

        // 3. Выбрать несколько ложных симптомов.
        const allSymptoms = await Symptom.find({});
        const incorrectSymptoms = allSymptoms
            .filter(s => !correctSymptoms.includes(s.name))
            .sort(() => 0.5 - Math.random())
            .slice(0, 3) // Выбираем 3 ложных симптома
            .map(s => s.name);

        // 4. Объединить и перемешать все симптомы
        const allOptions = [...correctSymptoms, ...incorrectSymptoms].sort(() => 0.5 - Math.random());

        // 5. Отправить данные клиенту
        res.json({
            question: `Выберите симптомы, связанные с ${randomDisease.name}:`,
            options: allOptions,
            correctAnswers: correctSymptoms
        });
    } catch (error) {
        console.error('Ошибка в мини-игре "Симптомы":', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере.' });
    }
};