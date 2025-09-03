// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import MainPage from './components/MainPage';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SuccessPage from './components/SuccessPage';
import PlayersPage from './components/PlayersPage';
import ConstructorPage from './components/ConstructorPage';
import DatabasePage from './components/DatabasePage';
import LabPage from './components/LabPage';
import TasksListPage from './components/TasksListPage';

function AppContent() { // Renamed App to AppContent for correct routing setup
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleRegisterSuccess = () => {
        navigate('/success');
    };
    
    return (
        <div className={user ? 'dashboard-layout' : 'centered-layout'}>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
                <Route path="/register" element={<RegisterPage onRegisterSuccess={handleRegisterSuccess} />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route
                    path="/dashboard"
                    element={user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/players"
                    element={user ? <PlayersPage user={user} /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/constructor"
                    element={user ? <ConstructorPage user={user} /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/database"
                    element={<DatabasePage user={user} />}
                />
                <Route
                    path="/lab"
                    element={user ? <LabPage user={user} /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/tasks-list"
                    element={user ? <TasksListPage user={user} /> : <Navigate to="/login" replace />}
                />
                {/* Catch-all route to redirect unknown paths to the main page */}
                <Route path="*" element={<MainPage />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;