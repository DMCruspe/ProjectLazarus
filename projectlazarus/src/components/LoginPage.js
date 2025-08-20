// src/components/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
import VersionInfo from './VersionInfo';

const LoginPage = ({ onNavigate, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false });

    const handleLogin = async (e) => {
        // Prevent the default form submission behavior
        e.preventDefault();

        if (!username || !password) {
            setMessage({ text: 'Пожалуйста, введите логин и пароль.', isError: true });
            return;
        }

        try {
            const response = await axios.post('/api/auth/login', { username, password });
            
            // On successful login, save user data and navigate
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('credits', response.data.credits);
            
            setMessage({ text: 'Вход успешен!', isError: false });
            onLoginSuccess();
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Ошибка при входе. Попробуйте ещё раз.';
            setMessage({ text: errorMessage, isError: true });
        }
    };

    return (
        <div id="login-page" className="page-container">
            <h1 className="site-title">Войти в систему</h1>
            {/* Add onSubmit to the form and remove onClick from the button */}
            <form onSubmit={handleLogin} className="content-box">
                <p className="message-area" style={{ color: message.isError ? 'red' : 'green' }}>{message.text}</p>
                <div className="form-group">
                    <label htmlFor="login-username">Логин</label>
                    <input
                        type="text"
                        id="login-username"
                        placeholder="Пример данных для ввода"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">Пароль</label>
                    <input
                        type="password"
                        id="login-password"
                        placeholder="Пример данных для ввода"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {/* The button's type is "submit", so it will trigger the form's onSubmit handler */}
                <button type="submit" className="btn-primary">Авторизоваться</button>
                <button type="button" className="btn-back" onClick={() => onNavigate('main')}>Назад</button>
            </form>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <VersionInfo />
            </div>
        </div>
    );
};

export default LoginPage;