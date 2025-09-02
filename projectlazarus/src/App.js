import React, { useState } from 'react';
import './App.css';
import MainPage from './components/MainPage';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SuccessPage from './components/SuccessPage';
import PlayersPage from './components/PlayersPage';
import ConstructorPage from './components/ConstructorPage';

function App() {
    const [page, setPage] = useState('main');
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [layoutClass, setLayoutClass] = useState('centered-layout');

    const handleLogin = (userData) => {
        setUser(userData);
        setPage('dashboard');
        setLayoutClass('dashboard-layout');
    };

    const handleLogout = () => {
        setUser(null);
        setPage('main');
        setLayoutClass('centered-layout');
    };

    const handleNavigate = (targetPage) => {
        setPage(targetPage);
    };

    const renderPage = () => {
        switch (page) {
            case 'main':
                return <MainPage onNavigate={handleNavigate} />;
            case 'login':
                return <LoginPage onLoginSuccess={handleLogin} onNavigate={handleNavigate} />;
            case 'register':
                return <RegisterPage onNavigate={handleNavigate} />;
            case 'success':
                return <SuccessPage onNavigate={handleNavigate} message={message} />;
            case 'dashboard':
                return <DashboardPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
            case 'players':
                return <PlayersPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
            case 'constructor':
                return <ConstructorPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
            default:
                return <MainPage onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className={layoutClass}>
            {renderPage()}
        </div>
    );
}

export default App;