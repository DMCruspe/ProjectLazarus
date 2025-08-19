// src/components/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';

const RegisterPage = ({ onNavigate, onRegisterSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false });

    const handleRegister = async () => {
        if (!username || !password) {
            setMessage({ text: 'Пожалуйста, введите логин и пароль для регистрации.', isError: true });
            return;
        }

        try {
            await axios.post('/api/register', { username, password });
            onRegisterSuccess();
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Ошибка при регистрации. Попробуйте ещё раз.';
            setMessage({ text: errorMessage, isError: true });
        }
    };

    return (
        <div id="register-page" className="page-container">
            <h1 className="site-title">Регистрация</h1>
            <div className="content-box">
                <p className="message-area" style={{ color: message.isError ? 'red' : 'green' }}>{message.text}</p>
                <div className="form-group">
                    <label htmlFor="register-username">Логин</label>
                    <input
                        type="text"
                        id="register-username"
                        placeholder="Пример данных для ввода"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="register-password">Пароль</label>
                    <input
                        type="password"
                        id="register-password"
                        placeholder="Пример данных для ввода"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="btn-primary" onClick={handleRegister}>Присоединиться</button>
                <button className="btn-back" onClick={() => onNavigate('main')}>Назад</button>
            </div>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <p className="app-version">Version alpha ...</p>
            </div>
        </div>
    );
};

export default RegisterPage;