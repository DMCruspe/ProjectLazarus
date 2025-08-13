const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Определяем номер версии
const appVersion = '0.4';

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

// Создание схем и моделей
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
    },
    credits: {
        type: Number,
        default: 100
    }
});
const User = mongoose.model('User', UserSchema);

const DiseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['Вирус', 'Бактерия', 'Грибок'],
        default: 'Вирус'
    },
    symptoms: [String],
    resistance: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    vulnerabilities: [String],
    treatmentMethod: {
        type: String
    }
});
const Disease = mongoose.model('Disease', DiseaseSchema);

const VaccineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    disease: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disease'
    },
    efficiency: {
        type: Number,
        default: 0.8
    },
    cost: {
        type: Number,
        default: 50
    },
    duration: {
        type: Number,
        default: 30
    },
    dosage: {
        type: String,
        default: '1 ml'
    },
    sideEffects: [String]
});
const Vaccine = mongoose.model('Vaccine', VaccineSchema);

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
            res.status(200).json({
                message: 'Вход выполнен успешно',
                username: user.username,
                role: user.role,
                credits: user.credits
            });
        } else {
            res.status(401).json({ message: 'Неверный логин или пароль' });
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

// Роут для добавления кредитов (доступен только для superadmin)
app.post('/api/add-credits', async (req, res) => {
    const { username, amount } = req.body;

    try {
        const superAdminUser = await User.findOne({ username });
        if (!superAdminUser || superAdminUser.role !== 'superadmin') {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        superAdminUser.credits += amount;
        await superAdminUser.save();

        res.status(200).json({ message: `Баланс пользователя ${username} обновлен. Новый баланс: ${superAdminUser.credits}` });
    } catch (error) {
        console.error('Ошибка добавления кредитов:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});


// ---- НОВЫЕ МАРШРУТЫ ДЛЯ СТРАНИЦЫ ИГРОКОВ ----

// Роут для получения списка всех игроков (доступен для admin и superadmin)
app.get('/api/players', async (req, res) => {
    // В реальном проекте здесь будет проверка токена авторизации
    // А пока будем считать, что запрос приходит от авторизованного админа
    try {
        const users = await User.find({}, 'username role credits');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка получения списка игроков' });
    }
});

// Роут для обновления баланса игрока (доступен для admin и superadmin)
app.post('/api/players/update-credits', async (req, res) => {
    const { requesterUsername, targetUsername, amount } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        targetUser.credits += amount;
        await targetUser.save();
        res.status(200).json({ message: `Баланс пользователя ${targetUsername} обновлен.`, newCredits: targetUser.credits });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении баланса' });
    }
});

// Роут для смены роли игрока (доступен только для superadmin)
app.post('/api/players/toggle-role', async (req, res) => {
    const { requesterUsername, targetUsername, newRole } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || requester.role !== 'superadmin') {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        if (requesterUsername === targetUsername) {
            return res.status(403).json({ message: 'Вы не можете изменить свою собственную роль' });
        }
        
        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        targetUser.role = newRole;
        await targetUser.save();
        res.status(200).json({ message: `Роль пользователя ${targetUsername} изменена на ${newRole}.`, newRole: targetUser.role });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при смене роли' });
    }
});

// Роут для удаления аккаунта (доступен только для superadmin)
app.post('/api/players/delete', async (req, res) => {
    const { requesterUsername, targetUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || requester.role !== 'superadmin') {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        if (requesterUsername === targetUsername) {
            return res.status(403).json({ message: 'Вы не можете удалить свой собственный аккаунт' });
        }

        const result = await User.deleteOne({ username: targetUsername });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        res.status(200).json({ message: `Аккаунт ${targetUsername} успешно удалён.` });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении аккаунта' });
    }
});

// Отдача статических файлов (HTML, CSS, JS) из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));