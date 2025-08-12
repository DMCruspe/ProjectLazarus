const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet'); // Добавляем helmet для безопасности
const rateLimit = require('express-rate-limit'); // Добавляем rate-limit для защиты от брутфорса

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к базе данных MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Подключение к MongoDB успешно');
    // Запускаем сервер только после успешного подключения к БД
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
    });
})
.catch(err => {
    console.error('Ошибка подключения к MongoDB', err);
    // Выход из процесса, если подключение к БД не удалось
    process.exit(1); 
});

// Создание схемы и модели пользователя
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true }, // Добавили индекс
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Middleware для безопасности
app.use(helmet());
app.use(express.json());

// Ограничение скорости для защиты от брутфорса
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // Максимум 100 запросов с одного IP
    message: "Слишком много запросов с вашего IP, попробуйте позже."
});

// Роут для регистрации
app.post('/api/register', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Необходимо ввести логин и пароль' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: passwordHash });
        await newUser.save();
        res.status(201).json({ message: 'Регистрация прошла успешно' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Произошла ошибка при регистрации.' });
    }
});

// Роут для авторизации
app.post('/api/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Необходимо ввести логин и пароль' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Неверный логин или пароль.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный логин или пароль.' });
        }

        res.status(200).json({ message: 'Вход успешен!', username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Произошла ошибка при входе.' });
    }
});

// Отдача статических файлов (HTML, CSS, JS) из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));