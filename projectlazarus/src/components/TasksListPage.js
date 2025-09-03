// src/components/TasksListPage.js
import React, { useState } from 'react';
import './style-tasks-list.css';
import VersionInfo from './VersionInfo';
import { useNavigate } from 'react-router-dom';

const mockTasks = [
    { id: 1, title: 'Задание 1', description: 'Описание задания 1', completed: false },
    { id: 2, title: 'Задание 2', description: 'Описание задания 2', completed: true },
    { id: 3, title: 'Задание 3', description: 'Описание задания 3', completed: false },
];

// Add `user` as a prop if needed for future functionality
const TasksListPage = ({ user }) => {
    const [tasks, setTasks] = useState(mockTasks);
    const navigate = useNavigate();

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
                <VersionInfo />
            </footer>
        </div>
    );
};

export default TasksListPage;