// controllers/playerController.js

const User = require('../models/User'); // Подключаем модель пользователя
const UnauthorizedUser = require('../models/UnauthorizedUser'); // Подключаем модель для неавторизованных пользователей
const bcrypt = require('bcryptjs'); // Используем bcrypt для хеширования паролей

/**
 * @description Регистрация нового пользователя. Сохраняет его как неавторизованного.
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Проверяем, что логин и пароль предоставлены
        if (!username || !password) {
            return res.status(400).json({ message: 'Необходимо ввести логин и пароль' });
        }
        // Проверяем, существует ли пользователь (авторизованный или нет)
        const existingUser = await User.findOne({ username });
        const existingUnauthorizedUser = await UnauthorizedUser.findOne({ username });
        if (existingUser || existingUnauthorizedUser) {
            return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
        }
        // Хешируем пароль для безопасного хранения
        const passwordHash = await bcrypt.hash(password, 10);
        // Создаем нового неавторизованного пользователя
        const newUnauthorizedUser = new UnauthorizedUser({ username, password: passwordHash, requestDate: new Date() });
        await newUnauthorizedUser.save();
        res.status(201).json({ message: 'Запрос на регистрацию отправлен. Дождитесь авторизации администратором.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Произошла ошибка при регистрации.' });
    }
};

/**
 * @description Авторизация пользователя.
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Ищем пользователя в основной базе
        const user = await User.findOne({ username });
        if (!user) {
            // Если не нашли, проверяем, ожидает ли он авторизации
            const unauthorizedUser = await UnauthorizedUser.findOne({ username });
            if (unauthorizedUser) {
                return res.status(401).json({ message: 'Ваш аккаунт ожидает авторизации администратором.' });
            }
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }
        // Сравниваем предоставленный пароль с хешем в базе
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            // Успешная авторизация
            res.status(200).json({
                message: 'Вход выполнен успешно',
                username: user.username,
                role: user.role,
                credits: user.credits
            });
        } else {
            // Неверный пароль
            res.status(401).json({ message: 'Неверный логин или пароль' });
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
};

/**
 * @description Получение списка авторизованных игроков.
 * @route POST /api/players
 */
exports.getPlayers = async (req, res) => {
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
};

/**
 * @description Получение списка неавторизованных игроков.
 * @route POST /api/players/unauthorized-players
 */
exports.getUnauthorizedPlayers = async (req, res) => {
    const { requesterUsername } = req.body;
    try {
        const requesterUser = await User.findOne({ username: requesterUsername });
        if (!requesterUser || (requesterUser.role !== 'admin' && requesterUser.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Доступ запрещен.' });
        }
        const unauthorizedPlayers = await UnauthorizedUser.find({}); // Запрос к UnauthorizedUser
        const responseData = unauthorizedPlayers.map(player => ({
            username: player.username,
            requestDate: player.requestDate
        }));
        res.json(responseData);
    } catch (error) {
        console.error('Ошибка при получении списка неавторизованных игроков:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * @description Добавление кредитов игроку. Доступно только суперадмину.
 * @route POST /api/players/add-credits
 */
exports.addCredits = async (req, res) => {
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
};

/**
 * @description Обновление кредитов конкретного игрока.
 * @route POST /api/players/update-credits
 */
exports.updatePlayerCredits = async (req, res) => {
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
};

/**
 * @description Переключение роли игрока. Доступно только суперадмину.
 * @route POST /api/players/toggle-role
 */
exports.togglePlayerRole = async (req, res) => {
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
};

/**
 * @description Удаление аккаунта игрока. Доступно только суперадмину.
 * @route POST /api/players/delete
 */
exports.deletePlayer = async (req, res) => {
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
};