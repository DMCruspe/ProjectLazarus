import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import VersionInfo from './VersionInfo';

const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setMessage({ text: 'Пожалуйста, введите логин и пароль.', isError: true });
            return;
        }

        try {
            const response = await axios.post('/api/auth/login', { username, password });
            
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('credits', response.data.credits);
            
            // Успешный вход. Устанавливаем сообщение и вызываем перенаправление.
            setMessage({ text: 'Вход успешен!', isError: false });
            // onLoginSuccess() должен перенаправить вас на нужную страницу.
            onLoginSuccess(response.data);
            
        } catch (error) {
            // Если запрос не успешен, обрабатываем ошибку.
            const errorMessage = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : 'Ошибка при входе. Попробуйте ещё раз.';
            setMessage({ text: errorMessage, isError: true });
        }
    };

    return (
        <div id="login-page" className="page-container">
            <h1 className="site-title">Войти в систему</h1>
            <form onSubmit={handleLogin} className="content-box">
                {message.text && (
                    <p className="message-area" style={{ color: message.isError ? 'red' : 'green' }}>
                        {message.text}
                    </p>
                )}
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
                <button type="submit" className="btn-primary">Авторизоваться</button>
                <button type="button" className="btn-back" onClick={() => navigate('/')}>Назад</button>
            </form>
            <div className="footer">
                <p>Powered by Follow Me</p>
                <VersionInfo />
            </div>
        </div>
    );
};

export default LoginPage;