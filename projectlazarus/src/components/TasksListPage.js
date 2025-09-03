import React, { useState } from 'react';
import './style-tasks-list.css';
import VersionInfo from './VersionInfo'; // **ИМПОРТИРУЕМ КОМПОНЕНТ**

const mockTasks = [
    { id: 1, title: 'Задание 1', description: 'Описание задания 1', completed: false },
    { id: 2, title: 'Задание 2', description: 'Описание задания 2', completed: true },
    { id: 3, title: 'Задание 3', description: 'Описание задания 3', completed: false },
];

const TasksListPage = () => {
    const [tasks, setTasks] = useState(mockTasks);

    return (
        <div className="tasks-list-container">
            <header className="tasks-list-header">
                <h1>Список задач</h1>
            </header>
            <main>
                <ul className="tasks-list">
                    {tasks.map(task => (
                        <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <span className="task-status">
                                {task.completed ? 'Выполнено' : 'В процессе'}
                            </span>
                        </li>
                    ))}
                </ul>
            </main>
            <footer className="tasks-list-footer">
                <p>Powered by Follow Me</p>
                {/* ИСПОЛЬЗУЕМ КОМПОНЕНТ VersionInfo ЗДЕСЬ */}
                <VersionInfo /> 
            </footer>
        </div>
    );
};

export default TasksListPage;