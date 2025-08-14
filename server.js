const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Определяем номер версии
const appVersion = '0336';

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
    },
    credits: {
        type: Number,
        default: 100
    }
});
const User = mongoose.model('User', UserSchema);

// Новая схема для заданий с полем title и createdAt
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    taskType: { type: String, required: true },
    description: { type: String, required: true },
    reward: { type: Number, required: true, min: 0 },
    performer: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ['active', 'in_progress', 'completed'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);

// НОВАЯ СХЕМА ДЛЯ БОЛЕЗНЕЙ
const diseaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    symptoms: { type: String, required: true },
    spread: { type: String, required: true },
    resistance: { type: String, required: true },
    vulnerabilities: { type: String, required: true },
    treatment: { type: String, required: true },
    vaccine: { type: String }, // Добавлено новое поле
    createdAt: { type: Date, default: Date.now }
});
const Disease = mongoose.model('Disease', diseaseSchema);

// Middleware для безопасности
app.use(helmet());
app.use(express.json());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Слишком много запросов с вашего IP, попробуйте позже."
});

// Роут для получения номера версии
app.get('/api/version', (req, res) => {
    res.json({ version: appVersion });
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

// Роут для добавления кредитов себе (доступен только для superadmin)
app.post('/api/add-credits', async (req, res) => {
    const { username, amount } = req.body;

    try {
        const superAdminUser = await User.findOne({ username });
        if (!superAdminUser || superAdminUser.role !== 'superadmin') {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        superAdminUser.credits += amount;
        await superAdminUser.save();

        res.status(200).json({ message: `Ваш баланс обновлен. Новый баланс: ${superAdminUser.credits}`, newCredits: superAdminUser.credits });
    } catch (error) {
        console.error('Ошибка добавления кредитов:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

// Роут для получения списка всех игроков (доступен для admin и superadmin)
app.post('/api/players', async (req, res) => {
    const { requesterUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        
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

// Роут для создания нового задания (доступен только для admin и superadmin)
app.post('/api/tasks/create', async (req, res) => {
    const { requesterUsername, title, taskType, description, reward, performer } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        
        const newTask = new Task({
            title,
            taskType,
            description,
            reward,
            performer,
            createdBy: requesterUsername
        });
        await newTask.save();
        res.status(201).json({ message: 'Задание успешно создано.' });
    } catch (error) {
        console.error('Ошибка при создании задания:', error);
        res.status(500).json({ message: 'Ошибка при создании задания' });
    }
});

// Роут для получения списка заданий для отображения на site2.html
app.post('/api/tasks', async (req, res) => {
    const { username } = req.body;
    try {
        const tasks = await Task.find({ 
            $or: [
                { status: 'active', performer: 'All' },
                { performer: username },
                { status: 'in_progress', performer: username }
            ]
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении списка заданий' });
    }
});

// Роут для получения ВСЕХ заданий (для страницы Список заданий)
app.post('/api/tasks/list', async (req, res) => {
    const { requesterUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        const tasks = await Task.find({});
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении списка заданий' });
    }
});

// Роут для принятия задания
app.post('/api/tasks/accept', async (req, res) => {
    const { taskId, username } = req.body;
    try {
        const task = await Task.findById(taskId);

        if (!task || task.status !== 'active' || (task.performer !== 'All' && task.performer !== username)) {
            return res.status(400).json({ message: 'Задание недоступно для принятия' });
        }
        
        // --- ДОБАВЛЕНА НОВАЯ ПРОВЕРКА ---
        const acceptedTasksCount = await Task.countDocuments({ performer: username, status: 'in_progress' });
        if (acceptedTasksCount >= 2) {
            return res.status(400).json({ message: 'Вы не можете принять больше двух заданий.' });
        }
        // -------------------------------
        
        task.performer = username;
        task.status = 'in_progress';
        await task.save();
        
        res.status(200).json({ message: 'Задание успешно принято' });
    } catch (error) {
        console.error('Ошибка при принятии задания:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

// Роут для выполнения задания (для admin/superadmin)
app.post('/api/tasks/complete', async (req, res) => {
    const { taskId, requesterUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Задание не найдено' });
        }
        
        const performer = await User.findOne({ username: task.performer });
        if (!performer) {
            return res.status(404).json({ message: 'Исполнитель не найден' });
        }
        
        performer.credits += task.reward;
        await performer.save();
        await Task.deleteOne({ _id: taskId });
        
        res.status(200).json({ message: `Задание выполнено. ${task.reward} R начислено пользователю ${performer.username}.` });
    } catch (error) {
        console.error('Ошибка при выполнении задания:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

// Роут для удаления задания (для admin/superadmin)
app.post('/api/tasks/delete', async (req, res) => {
    const { taskId, requesterUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        await Task.deleteOne({ _id: taskId });
        res.status(200).json({ message: 'Задание успешно удалено.' });
    } catch (error) {
        console.error('Ошибка при удалении задания:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

// Роут для смены исполнителя (для admin/superadmin)
app.post('/api/tasks/change-performer', async (req, res) => {
    const { taskId, newPerformer, requesterUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Задание не найдено' });
        }
        task.performer = newPerformer;
        task.status = 'active'; // Возвращаем статус в active
        await task.save();
        res.status(200).json({ message: `Исполнитель задания успешно изменен на ${newPerformer}.` });
    } catch (error) {
        console.error('Ошибка при смене исполнителя:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

// НОВЫЙ РОУТ ДЛЯ СОЗДАНИЯ БОЛЕЗНИ
app.post('/api/disease/create', async (req, res) => {
    const { name, type, symptoms, spread, resistance, vulnerabilities, treatment, vaccine } = req.body;

    // Простая валидация (vaccine не обязателен)
    if (!name || !type || !symptoms || !spread || !resistance || !vulnerabilities || !treatment) {
        return res.status(400).json({ message: 'Заполните все обязательные поля.' });
    }

    try {
        const newDisease = new Disease({
            name,
            type,
            symptoms,
            spread,
            resistance,
            vulnerabilities,
            treatment,
            vaccine // Сохраняем новое поле
        });
        await newDisease.save();
        res.status(201).json({ message: 'Болезнь успешно создана!' });
    } catch (error) {
        console.error('Ошибка при создании болезни:', error);
        res.status(500).json({ message: 'Ошибка при создании болезни' });
    }
});

// Роут для получения списка всех болезней
app.post('/api/diseases/list', async (req, res) => {
    try {
        const diseases = await Disease.find({});
        res.status(200).json(diseases);
    } catch (error) {
        console.error('Ошибка при получении списка болезней:', error);
        res.status(500).json({ message: 'Ошибка при получении списка болезней' });
    }
});

app.post('/api/disease/delete', async (req, res) => {
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
});

// Отдача статических файлов (HTML, CSS, JS) из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));