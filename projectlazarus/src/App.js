import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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

function App() {
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <Router>
            <div className={user ? 'dashboard-layout' : 'centered-layout'}>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route 
                        path="/dashboard" 
                        element={user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
                    />
                    <Route 
                        path="/players" 
                        element={user ? <PlayersPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
                    />
                    <Route 
                        path="/constructor" 
                        element={user ? <ConstructorPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
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
                    {/* Catch all other routes */}
                    <Route path="*" element={<MainPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;