const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
.catch(err => console.error('Ошибка подключения к MongoDB', err));

// Создание схемы и модели пользователя
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true } // Изменили имя поля на `password`
});

const User = mongoose.model('User', UserSchema);

// Middleware для обработки JSON-запросов
app.use(express.json());

// Роут для регистрации
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        // Сохраняем хеш в поле `password`
        const newUser = new User({ username, password: passwordHash });
        await newUser.save();
        res.status(201).json({ message: 'Регистрация прошла успешно' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка регистрации', error: err.message });
    }
});

// Роут для авторизации
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Находим пользователя в базе данных
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Неверный логин или пароль.' });
        }

        // Сравниваем пароль с хешем, который хранится в `user.password`
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный логин или пароль.' });
        }

        // Если все успешно, отправляем имя пользователя
        res.status(200).json({ message: 'Вход успешен!', username: user.username });

    } catch (err) {
        res.status(500).json({ message: 'Ошибка входа', error: err.message });
    }
});

// Отдача статических файлов (HTML, CSS, JS) из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));