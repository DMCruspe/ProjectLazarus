const Task = require('../models/Task');
const User = require('../models/User'); // Предполагается, что модель User существует

// ОБЪЕДИНЕННЫЙ И ИСПРАВЛЕННЫЙ РОУТ ДЛЯ СОЗДАНИЯ НОВОГО ЗАДАНИЯ
exports.createTask = async (req, res) => {
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
};

// Роут для получения списка заданий для отображения на site2.html
exports.getTasksForPlayer = async (req, res) => {
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
};

// Роут для получения ВСЕХ заданий (для страницы Список заданий)
exports.getAllTasks = async (req, res) => {
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
};

// Роут для принятия задания
exports.acceptTask = async (req, res) => {
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
};

// Роут для выполнения задания (для admin/superadmin)
exports.completeTask = async (req, res) => {
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
};

// Роут для удаления задания (для admin/superadmin)
exports.deleteTask = async (req, res) => {
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
};

// Роут для смены исполнителя (для admin/superadmin)
exports.changePerformer = async (req, res) => {
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
};