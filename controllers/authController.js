const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UnauthorizedUser = require('../models/UnauthorizedUser');

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
};