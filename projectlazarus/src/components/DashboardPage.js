// src/components/DashboardPage.js
import React, { useState, useEffect } from 'react';
import '../App.css';
import VersionInfo from './VersionInfo';

const DashboardPage = ({ onNavigate }) => {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        const credits = localStorage.getItem('credits');

        if (username) {
            setUser({ username, role, credits });
            fetchAndDisplayTasks(username);
        } else {
            onNavigate('login');
        }
    }, [onNavigate]);

    const fetchAndDisplayTasks = async (username) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const tasks = await response.json();
            setTasks(tasks);
        } catch (error) {
            console.error('Ошибка при загрузке заданий:', error);
            setTasks([]);
        }
    };

    const handleTaskAction = async (action, taskId) => {
        try {
            const response = await fetch(`/api/tasks/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, username: user.username }),
            });
            const result = await response.json();
            if (!response.ok) {
                alert('Ошибка: ' + result.message);
            } else {
                alert(result.message);
                fetchAndDisplayTasks(user.username);
            }
        } catch (error) {
            console.error(`Ошибка при ${action} задания:`, error);
            alert('Произошла ошибка.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('credits');
        onNavigate('main');
    };
    
    if (!user) {
        return <div>Загрузка...</div>;
    }

    const activeTasks = tasks.filter(task => task.status === 'active');
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');

    return (
        <div className="dashboard-container">
            <header className="header">
                <h1>Название</h1>
                <div className="header-info">
                    <span className="welcome-message">Добро пожаловать, {user.username}!</span>
                    <div className="header-credits">
                        <span id="credits">{user.credits} R</span>
                        {user.role === 'superadmin' && (
                            <button id="add-credits-btn" className="credits-btn">+</button>
                        )}
                    </div>
                </div>
            </header>
            <div className="content-container">
                <aside className="left-panel">
                    <h2>Навигация</h2>
                    <nav>
                        {['admin', 'superadmin'].includes(user.role) && (
                            <>
                                {/* Добавлены обработчики onClick */}
                                <button onClick={() => onNavigate('constructor')} className="nav-button">Конструктор</button>
                                <button onClick={() => onNavigate('players')} className="nav-button">Игроки</button>
                                <button onClick={() => onNavigate('tasks_list')} className="nav-button">Список заданий</button>
                            </>
                        )}
                        {/* Добавлены обработчики onClick */}
                        <button onClick={() => onNavigate('lab')} className="nav-button">Лаборатория</button>
                        <button onClick={() => onNavigate('database')} className="nav-button">База данных</button>
                        <button className="nav-button" onClick={handleLogout}>Выйти</button>
                    </nav>
                    <div className="version-info-container">
                        <VersionInfo />
                    </div>
                </aside>
                <main className="main-content-panel">
                    <div className="tasks-section">
                        <h2>Принятые задания</h2>
                        <div id="accepted-tasks-container">
                            {[0, 1].map(index => {
                                const task = inProgressTasks[index];
                                return (
                                    <div key={index} className="accepted-task-card">
                                        {task ? (
                                            <>
                                                <h3>{task.title}</h3>
                                                <p>{task.description}</p>
                                                <p>Награда: {task.reward} R</p>
                                            </>
                                        ) : (
                                            <p className="placeholder-text">Задание не принято</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="available-tasks-section">
                        <h2>Доступные задания</h2>
                        <div id="tasks-list-container">
                            {activeTasks.length > 0 ? (
                                activeTasks.map(task => (
                                    <div key={task._id} className="task-card">
                                        <h3>{task.title}</h3>
                                        <p>{task.description}</p>
                                        <p>Награда: {task.reward} R</p>
                                        <div className="task-actions">
                                            <button
                                                className="accept-btn"
                                                onClick={async () => {
                                                    if (inProgressTasks.length >= 2) {
                                                        alert('Вы уже приняли максимально возможное количество заданий.');
                                                        return;
                                                    }
                                                    await handleTaskAction('accept', task._id);
                                                }}
                                            >
                                                Принять
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Нет доступных заданий.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;