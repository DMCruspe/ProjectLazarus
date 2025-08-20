const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const taskRoutes = require('./routes/taskRoutes');
const minigameRoutes = require('./routes/minigameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json());

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://projectlazarusfm-f683a7a1bd5c.herokuapp.com' 
        : '*'
}));

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

app.get('/api/version', (req, res) => {
    res.json({ version: '0620' });
});

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/minigame', minigameRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'projectlazarus/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'projectlazarus/build', 'index.html'));
    });
}