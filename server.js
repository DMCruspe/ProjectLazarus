const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');

// Подключаем файлы с маршрутами
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const taskRoutes = require('./routes/taskRoutes');
const minigameRoutes = require('./routes/minigameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(express.json());

// Подключение к базе данных MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Подключение к MongoDB успешно');
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
    });
})
.catch(err => {
    console.error('Ошибка подключения к MongoDB', err);
    process.exit(1);
});

// Основные маршруты
app.get('/api/version', (req, res) => {
    res.json({ version: '0500' });
});

// Подключение модулей маршрутов
app.use('/api', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/minigame', minigameRoutes);

// Отдача статических файлов
app.use(express.static(path.join(__dirname, 'public')));