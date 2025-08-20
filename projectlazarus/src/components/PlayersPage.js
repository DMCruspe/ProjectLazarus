// src/components/PlayersPage.jsx

import React, { useState, useEffect } from 'react';
import '../App.css';
import './PlayersPage.css';
import VersionInfo from './VersionInfo';

const PlayersPage = ({ onNavigate }) => {
    const [user, setUser] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isAuthorizedView, setIsAuthorizedView] = useState(true);
    const [pageTitle, setPageTitle] = useState('Авторизованные аккаунты');

    useEffect(() => {
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        const credits = localStorage.getItem('credits');

        if (username) {
            setUser({ username, role, credits });
        } else {
            onNavigate('login');
        }
    }, [onNavigate]);

    useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'superadmin') {
                if (isAuthorizedView) {
                    fetchAuthorizedPlayers();
                } else {
                    fetchUnauthorizedPlayers();
                }
            } else {
                alert('Доступ запрещён.');
                onNavigate('dashboard');
            }
        }
    }, [user, isAuthorizedView, onNavigate]);

    const fetchAuthorizedPlayers = async () => {
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterUsername: user.username })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            const data = await response.json();
            setPlayers(data);
        } catch (error) {
            console.error('Ошибка при загрузке игроков:', error);
            alert('Ошибка при загрузке данных: ' + error.message);
            setPlayers([]);
        }
    };

    const fetchUnauthorizedPlayers = async () => {
        try {
            const response = await fetch('/api/unauthorized-players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterUsername: user.username })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            const data = await response.json();
            setPlayers(data);
        } catch (error) {
            console.error('Ошибка при загрузке неавторизованных аккаунтов:', error);
            alert('Ошибка при загрузке данных: ' + error.message);
            setPlayers([]);
        }
    };

    const handleAddCredits = async (targetUsername) => {
        const amount = prompt('Введите количество кредитов для добавления:', 100);
        if (amount && !isNaN(amount)) {
            try {
                const response = await fetch('/api/players/update-credits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: user.username, targetUsername, amount: parseInt(amount, 10) })
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }
                alert(`Баланс пользователя ${targetUsername} успешно обновлен.`);
                fetchAuthorizedPlayers();
            } catch (error) {
                console.error('Ошибка при обновлении баланса:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    };

    const handleToggleRole = async (targetUsername, currentRole) => {
        if (targetUsername === user.username) {
            alert('Вы не можете изменить свою собственную роль.');
            return;
        }
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (window.confirm(`Вы уверены, что хотите сменить роль пользователя ${targetUsername} на "${newRole}"?`)) {
            try {
                const response = await fetch('/api/players/toggle-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: user.username, targetUsername, newRole })
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }
                alert(`Роль пользователя ${targetUsername} успешно изменена на "${newRole}".`);
                fetchAuthorizedPlayers();
            } catch (error) {
                console.error('Ошибка при смене роли:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    };

    const handleDeleteAccount = async (targetUsername) => {
        if (targetUsername === user.username) {
            alert('Вы не можете удалить свой собственный аккаунт.');
            return;
        }
        if (window.confirm(`Вы уверены, что хотите удалить аккаунт ${targetUsername}? Это действие необратимо.`)) {
            try {
                const response = await fetch('/api/players/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: user.username, targetUsername })
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }
                alert(`Аккаунт ${targetUsername} успешно удалён.`);
                fetchAuthorizedPlayers();
            } catch (error) {
                console.error('Ошибка при удалении аккаунта:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    };

    const handleAuthorizeAccount = async (targetUsername) => {
        if (window.confirm(`Вы уверены, что хотите авторизовать аккаунт ${targetUsername}?`)) {
            try {
                const response = await fetch('/api/authorize-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: user.username, targetUsername })
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }
                alert(`Аккаунт ${targetUsername} успешно авторизован.`);
                fetchUnauthorizedPlayers();
            } catch (error) {
                console.error('Ошибка при авторизации аккаунта:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    };

    const handleDeleteUnauthorizedAccount = async (targetUsername) => {
        if (window.confirm(`Вы уверены, что хотите удалить запрос на авторизацию для аккаунта ${targetUsername}?`)) {
            try {
                const response = await fetch('/api/delete-unauthorized-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: user.username, targetUsername })
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }
                alert(`Запрос на авторизацию для аккаунта ${targetUsername} успешно удалён.`);
                fetchUnauthorizedPlayers();
            } catch (error) {
                console.error('Ошибка при удалении запроса на авторизацию:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    };

    if (!user) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="header">
                <h1 className="page-title">Игроки</h1>
                <div className="header-credits">
                    <span id="credits">{user.credits} R</span>
                </div>
            </header>
            <div className="content-container">
                <aside className="left-panel">
                    <h2>Навигация</h2>
                    <nav>
                        <button
                            id="authorized-accounts-btn"
                            className="nav-button"
                            onClick={() => {
                                setIsAuthorizedView(true);
                                setPageTitle('Авторизованные аккаунты');
                            }}
                        >
                            Авторизованные аккаунты
                        </button>
                        <button
                            id="unauthorized-accounts-btn"
                            className="nav-button"
                            onClick={() => {
                                setIsAuthorizedView(false);
                                setPageTitle('Не авторизованные аккаунты');
                            }}
                        >
                            Не авторизованные аккаунты
                        </button>
                        <button
                            id="back-to-main"
                            className="nav-button"
                            onClick={() => onNavigate('dashboard')}
                        >
                            Назад
                        </button>
                    </nav>
                    <div className="version-info-container">
                        <VersionInfo />
                    </div>
                </aside>
                <main className="center-panel players-panel">
                    <h2 id="panel-title">{pageTitle}</h2>
                    <table id="players-table">
                        <thead>
                            {isAuthorizedView ? (
                                <tr>
                                    <th>Логин</th>
                                    <th>Роль</th>
                                    <th>Баланс (R)</th>
                                    <th>Действия</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Дата запроса</th>
                                    <th>Логин</th>
                                    <th>Действия</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {players.length === 0 ? (
                                <tr>
                                    <td colSpan={isAuthorizedView ? 4 : 3}>
                                        {isAuthorizedView
                                            ? 'Список игроков пуст.'
                                            : 'Список не авторизованных аккаунтов пуст.'}
                                    </td>
                                </tr>
                            ) : (
                                players.map((player) => (
                                    <tr key={player.username}>
                                        {isAuthorizedView ? (
                                            <>
                                                <td>{player.username}</td>
                                                <td>{player.role}</td>
                                                <td>{player.credits}</td>
                                                <td>
                                                    <button onClick={() => handleAddCredits(player.username)} className="action-btn">
                                                        Добавить R
                                                    </button>
                                                    {user.role === 'superadmin' && (
                                                        <>
                                                            <button onClick={() => handleToggleRole(player.username, player.role)} className="action-btn">
                                                                Сменить роль
                                                            </button>
                                                            <button onClick={() => handleDeleteAccount(player.username)} className="action-btn delete-btn">
                                                                Удалить
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{new Date(player.requestDate).toLocaleString()}</td>
                                                <td>{player.username}</td>
                                                <td>
                                                    <button onClick={() => handleAuthorizeAccount(player.username)} className="action-btn">
                                                        Авторизовать
                                                    </button>
                                                    <button onClick={() => handleDeleteUnauthorizedAccount(player.username)} className="action-btn delete-btn">
                                                        Удалить
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </main>
            </div>
        </div>
    );
};

export default PlayersPage;