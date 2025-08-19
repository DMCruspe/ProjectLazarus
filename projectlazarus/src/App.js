// src/App.js
import React, { useState } from 'react';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SuccessPage from './components/SuccessPage';
import './App.css'; // Импортируем стили

function App() {
    const [currentPage, setCurrentPage] = useState('main');

    const handleLoginSuccess = () => {
        // При успешном входе перенаправляем на "основную страницу" (или другой URL, если нужно)
        window.location.href = '/site2.html';
    };

    const handleRegisterSuccess = () => {
        setCurrentPage('success');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'main':
                return <MainPage onNavigate={setCurrentPage} />;
            case 'login':
                return <LoginPage onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />;
            case 'register':
                return <RegisterPage onNavigate={setCurrentPage} onRegisterSuccess={handleRegisterSuccess} />;
            case 'success':
                return <SuccessPage onNavigate={setCurrentPage} />;
            default:
                return <MainPage onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className="App">
            {renderPage()}
        </div>
    );
}

export default App;