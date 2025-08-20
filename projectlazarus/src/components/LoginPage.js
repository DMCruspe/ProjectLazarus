import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // Верно, уже было в вашем коде

const LoginPage = ({ onNavigate, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false });

    const handleLogin = async () => {
        if (!username || !password) {
            setMessage({ text: 'Пожалуйста, введите логин и пароль.', isError: true });
            return;
        }

        try {
            const response = await axios.post('/api/login', { username, password });
            
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('credits', response.data.credits);
            
            onLoginSuccess();
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Ошибка при входе. Попробуйте ещё раз.';
            setMessage({ text: errorMessage, isError: true });
        }
    };

    return (
        <div id="login-page" className="page-container">
            <h1 className="site-title">Войти в систему</h1>
            <div className="content-box">
                <p className="message-area" style={{ color: message.isError ? 'red' : 'green' }}>{message.text}</p>
                <div className="form-group">
                    <label htmlFor="login-username">Логин</label>
                    <input
                        type="text"
                        id="login-username"
                        placeholder="Пример данных для ввода"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                    />
                </div>
                <button className="btn-primary" onClick={handleLogin}>Авторизоваться</button>
                <button className="btn-back" onClick={() => onNavigate('main')}>Назад</button>
            </div>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <VersionInfo />
            </div>
        </div>
    );
};

export default LoginPage;