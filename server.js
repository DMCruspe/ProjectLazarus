const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Определяем номер версии
const appVersion = '0500';

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

// СХЕМА ДЛЯ НЕАВТОРИЗОВАННЫХ АККАУНТОВ
const UnauthorizedUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    requestDate: {
        type: Date,
        default: Date.now
    }
});
const UnauthorizedUser = mongoose.model('UnauthorizedUser', UnauthorizedUserSchema);

// СХЕМА ДЛЯ ЗАДАНИЙ
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

// ИСПРАВЛЕННАЯ СХЕМА ДЛЯ БОЛЕЗНЕЙ
const diseaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String },
    symptoms: { type: String },
    spread: { type: String },
    resistance: { type: String },
    vulnerabilities: { type: String },
    treatment: { type: String },
    vaccine: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const Disease = mongoose.model('Disease', diseaseSchema);

// СХЕМА ДЛЯ ВАКЦИН
const vaccineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    diseaseName: { type: String, required: true },
    dosage: { type: String, required: true },
    effectiveness: { type: Number, required: true, min: 0, max: 100 },
    sideEffects: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const Vaccine = mongoose.model('Vaccine', vaccineSchema);

// СХЕМА ДЛЯ СИМПТОМОВ
const symptomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subgroup: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Symptom = mongoose.model('Symptom', symptomSchema);

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

// РОУТ ДЛЯ РЕГИСТРАЦИИ
app.post('/api/register', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Необходимо ввести логин и пароль' });
        }
        const existingUser = await User.findOne({ username });
        const existingUnauthorizedUser = await UnauthorizedUser.findOne({ username });
        if (existingUser || existingUnauthorizedUser) {
            return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUnauthorizedUser = new UnauthorizedUser({ username, password: passwordHash });
        await newUnauthorizedUser.save();
        res.status(201).json({ message: 'Запрос на регистрацию отправлен. Дождитесь авторизации администратором.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Произошла ошибка при регистрации.' });
    }
});

// РОУТ ДЛЯ АВТОРИЗАЦИИ
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            const unauthorizedUser = await UnauthorizedUser.findOne({ username });
            if (unauthorizedUser) {
                return res.status(401).json({ message: 'Ваш аккаунт ожидает авторизации администратором.' });
            }
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

// РОУТ ДЛЯ ПОЛУЧЕНИЯ СПИСКА НЕАВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ
app.post('/api/unauthorized-players', async (req, res) => {
    const { requesterUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        const unauthorizedUsers = await UnauthorizedUser.find({}, 'username requestDate');
        res.status(200).json(unauthorizedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка получения списка неавторизованных игроков' });
    }
});

// РОУТ ДЛЯ АВТОРИЗАЦИИ ПОЛЬЗОВАТЕЛЯ
app.post('/api/authorize-account', async (req, res) => {
    const { requesterUsername, targetUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        const unauthorizedUser = await UnauthorizedUser.findOne({ username: targetUsername });
        if (!unauthorizedUser) {
            return res.status(404).json({ message: 'Пользователь не найден в списке на авторизацию' });
        }
        const newUser = new User({
            username: unauthorizedUser.username,
            password: unauthorizedUser.password,
            role: 'user',
            credits: 100
        });
        await newUser.save();
        await UnauthorizedUser.deleteOne({ username: targetUsername });
        res.status(200).json({ message: `Аккаунт ${targetUsername} успешно авторизован.` });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при авторизации аккаунта' });
    }
});

// РОУТ ДЛЯ УДАЛЕНИЯ НЕАВТОРИЗОВАННОГО АККАУНТА
app.post('/api/delete-unauthorized-account', async (req, res) => {
    const { requesterUsername, targetUsername } = req.body;
    try {
        const requester = await User.findOne({ username: requesterUsername });
        if (!requester || (requester.role !== 'admin' && requester.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        const result = await UnauthorizedUser.deleteOne({ username: targetUsername });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Пользователь не найден в списке на авторизацию' });
        }
        res.status(200).json({ message: `Запрос на регистрацию для аккаунта ${targetUsername} успешно удалён.` });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении запроса' });
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

// ОБЪЕДИНЕННЫЙ И ИСПРАВЛЕННЫЙ РОУТ ДЛЯ СОЗДАНИЯ НОВОГО ЗАДАНИЯ
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
        const acceptedTasksCount = await Task.countDocuments({ performer: username, status: 'in_progress' });
        if (acceptedTasksCount >= 2) {
            return res.status(400).json({ message: 'Вы не можете принять больше двух заданий.' });
        }
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

// РОУТ ДЛЯ СОЗДАНИЯ БОЛЕЗНИ
app.post('/api/disease/create', async (req, res) => {
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

// Роут для удаления болезни
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

// Роут для создания вакцины
app.post('/api/vaccine/create', async (req, res) => {
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
});

// Роут для получения информации о вакцине по названию
app.post('/api/vaccine/info', async (req, res) => {
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
});

// Роут для получения списка всех симптомов
app.get('/api/symptoms/list', async (req, res) => {
    try {
        const symptoms = await Symptom.find({});
        res.status(200).json(symptoms);
    } catch (error) {
        console.error('Ошибка при получении списка симптомов:', error);
        res.status(500).json({ message: 'Ошибка при получении списка симптомов' });
    }
});

// Роут для добавления симптома
app.post('/api/symptom/add', async (req, res) => {
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
});

// Роут для удаления симптома
app.post('/api/symptom/delete', async (req, res) => {
    const { id } = req.body;
    try {
        await Symptom.findByIdAndDelete(id);
        res.status(200).json({ message: 'Симптом успешно удален.' });
    } catch (error) {
        console.error('Ошибка при удалении симптома:', error);
        res.status(500).json({ message: 'Ошибка при удалении симптома' });
    }
});

app.get('/api/minigame/identify-type', (req, res) => {
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
});

// Отдача статических файлов (HTML, CSS, JS) из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));