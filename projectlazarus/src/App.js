import React, { useState } from 'react';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SuccessPage from './components/SuccessPage';
import DashboardPage from './components/DashboardPage'; // ИМПОРТ НОВОГО КОМПОНЕНТА
import './App.css';

function App() {
    const [currentPage, setCurrentPage] = useState('main');

    const handleLoginSuccess = () => {
        setCurrentPage('dashboard'); // МЕНЯЕМ СОСТОЯНИЕ НА "DASHBOARD"
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
            case 'dashboard': // НОВЫЙ CASE
                return <DashboardPage onNavigate={setCurrentPage} />;
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