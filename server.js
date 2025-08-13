const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

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

// >>>>> ОСТАВЬТЕ ТОЛЬКО ЭТУ ЧАСТЬ МОДЕЛИ, ДРУГУЮ УДАЛИТЕ <<<<<
// Создание схемы и модели пользователя
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    }
});
const User = mongoose.model('User', UserSchema);
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// Middleware для безопасности
app.use(helmet());
app.use(express.json());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
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
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // ИЗМЕНЕНА ЭТА СТРОКА: теперь в ответе есть role
            res.status(200).json({ message: 'Вход выполнен успешно', username: user.username, role: user.role });
        } else {
            res.status(401).json({ message: 'Неверный логин или пароль' });
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

// Определяем номер версии
const appVersion = '0.2.25.3';

app.get('/api/version', (req, res) => {
    res.json({ version: appVersion });
});
// Отдача статических файлов (HTML, CSS, JS) из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));