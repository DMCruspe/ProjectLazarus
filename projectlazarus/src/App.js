// src/App.js

import React, { useState } from 'react';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SuccessPage from './components/SuccessPage';
import DashboardPage from './components/DashboardPage';
import ConstructorPage from './components/ConstructorPage';
import PlayersPage from './components/PlayersPage'; // <-- Импортируем новый компонент
import './App.css';

function App() {
    const [currentPage, setCurrentPage] = useState('main');

    const handleLoginSuccess = () => {
        setCurrentPage('dashboard');
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
            case 'dashboard':
                return <DashboardPage onNavigate={setCurrentPage} />;
            case 'constructor':
                return <ConstructorPage onNavigate={setCurrentPage} />;
            case 'players': // <-- Добавляем новый case для страницы игроков
                return <PlayersPage onNavigate={setCurrentPage} />;
            default:
                return <MainPage onNavigate={setCurrentPage} />;
        }
    };

    const layoutClass = currentPage === 'dashboard' || currentPage === 'constructor' || currentPage === 'players' ? 'dashboard-layout' : 'centered-layout';

    return (
        <div className={layoutClass}>
            {renderPage()}
        </div>
    );
}

export default App;