// controllers/authController.js

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UnauthorizedUser = require('../models/UnauthorizedUser');

/**
 * @description Registers a new user and places them in the unauthorized collection.
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Необходимо ввести логин и пароль' });
        }
        
        // Check if the user already exists in either collection
        const existingUser = await User.findOne({ username });
        const existingUnauthorizedUser = await UnauthorizedUser.findOne({ username });
        if (existingUser || existingUnauthorizedUser) {
            return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
        }
        
        // Hash the password securely
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create the new unauthorized user entry
        const newUnauthorizedUser = new UnauthorizedUser({ username, password: passwordHash, requestDate: new Date() });
        await newUnauthorizedUser.save();
        
        res.status(201).json({ message: 'Запрос на регистрацию отправлен. Дождитесь авторизации администратором.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Произошла ошибка при регистрации.' });
    }
};

/**
 * @description Authenticates a user and handles login attempts.
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find the user in the main collection
        const user = await User.findOne({ username });
        
        if (!user) {
            // If the user isn't in the main collection, check the unauthorized one
            const unauthorizedUser = await UnauthorizedUser.findOne({ username });
            if (unauthorizedUser) {
                return res.status(401).json({ message: 'Ваш аккаунт ожидает авторизации администратором.' });
            }
            // User not found in either collection
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        // Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (isPasswordValid) {
            // Successful login
            res.status(200).json({
                message: 'Вход выполнен успешно',
                username: user.username,
                role: user.role,
                credits: user.credits
            });
        } else {
            // Incorrect password
            res.status(401).json({ message: 'Неверный логин или пароль' });
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
};