// src/components/DashboardPage.js
import React, { useState, useEffect } from 'react';
import '../App.css'; // Предполагается, что здесь будут все ваши стили
import VersionInfo from './VersionInfo'; // Предполагается, что у вас есть этот компонент

const DashboardPage = ({ onNavigate }) => {
  // Используем хуки useState для хранения динамических данных
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  // useEffect для имитации DOMContentLoaded и получения данных
  useEffect(() => {
    // Проверяем данные пользователя в localStorage
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');

    if (username) {
      setUser({ username, role, credits });
      fetchAndDisplayTasks(username);
    } else {
      onNavigate('login'); // Используем onNavigate для перенаправления
    }
  }, [onNavigate]);

  const fetchAndDisplayTasks = async (username) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить задания');
      }

      const tasks = await response.json();
      setTasks(tasks);
    } catch (error) {
      console.error('Ошибка при загрузке заданий:', error);
      setTasks([]); // Устанавливаем пустой массив в случае ошибки
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
        fetchAndDisplayTasks(user.username); // Перезагружаем список
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
    onNavigate('main'); // Используем onNavigate для перехода на главную страницу
  };
  
  // Показываем состояние загрузки
  if (!user) {
      return <div>Загрузка...</div>;
  }

  // Фильтруем задания по статусу
  const activeTasks = tasks.filter(task => task.status === 'active');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Название</h1>
        <div className="header-credits">
          <span id="credits">{user.credits} R</span>
          {(user.role === 'superadmin') && (
            <button
              id="add-credits-btn"
              className="credits-btn"
              onClick={async () => {
                const amountToAdd = 100;
                // Добавьте сюда вашу логику для добавления кредитов
                // ...
                // Перезагрузите данные пользователя
              }}
            >
              +
            </button>
          )}
        </div>
      </div>
      <div className="container">
        <aside className="left-panel">
          <h2>Навигация</h2>
          <nav>
            {['admin', 'superadmin'].includes(user.role) && (
              <>
                <button className="nav-button" onClick={() => window.location.href = 'constructor.html'}>Конструктор</button>
                <button className="nav-button" onClick={() => window.location.href = 'players.html'}>Игроки</button>
                <button className="nav-button" onClick={() => window.location.href = 'tasks-list.html'}>Список заданий</button>
              </>
            )}
            <button className="nav-button" onClick={() => window.location.href = 'lab.html'}>Лаборатория</button>
            <button className="nav-button" onClick={() => window.location.href = 'database.html'}>База данных</button>
            <button className="nav-button" onClick={handleLogout}>Выйти</button>
          </nav>
        </aside>
        <main className="center-panel">
          <h2 id="welcome-message">Добро пожаловать, {user.username}!</h2>
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
          <div className="footer-info">
            <p>Powered by Follow Me</p>
            <VersionInfo />
          </div>
        </main>
        <aside className="right-panel">
          <h2>Задания</h2>
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
                        const acceptedCount = inProgressTasks.length;
                        if (acceptedCount >= 2) {
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
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;