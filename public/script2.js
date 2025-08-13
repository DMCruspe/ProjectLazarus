document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    
    const welcomeMessageElement = document.getElementById('welcome-message');
    const creditsElement = document.getElementById('credits');
    const addCreditsButton = document.getElementById('add-credits-btn');
    const tasksContainer = document.getElementById('tasks-list-container');

    if (username) {
        welcomeMessageElement.textContent = `Добро пожаловать, ${username}!`;
        if (creditsElement) {
            creditsElement.textContent = `${credits} R`;
        }
    } else {
        window.location.href = 'index.html';
    }
    
    // Обработчик для кнопки "Лаборатория"
    const labButton = document.getElementById('lab-button');
    if (labButton) {
        labButton.addEventListener('click', () => {
            window.location.href = 'lab.html';
        });
    }

    // Показываем кнопки для администраторов
    const playersButton = document.getElementById('players-button');
    const constructorButton = document.getElementById('constructor-button');

    if (role === 'admin' || role === 'superadmin') {
        if (playersButton) {
            playersButton.style.display = 'block';
            playersButton.addEventListener('click', () => {
                window.location.href = 'players.html';
            });
        }
        if (constructorButton) {
            constructorButton.style.display = 'block';
            constructorButton.addEventListener('click', () => {
                window.location.href = 'constructor.html';
            });
        }
    }
    
    // Показываем кнопку "+" только для superadmin
    if (role === 'superadmin' && addCreditsButton) {
        addCreditsButton.style.display = 'block';
        
        // Обработчик события для кнопки "+"
        addCreditsButton.addEventListener('click', async () => {
            const amountToAdd = 100; // Пример: добавляем 100 кредитов
            
            try {
                const response = await fetch('/api/add-credits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, amount: amountToAdd })
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert(result.message);
                    const newCredits = parseInt(localStorage.getItem('credits')) + amountToAdd;
                    localStorage.setItem('credits', newCredits);
                    creditsElement.textContent = `${newCredits} R`;
                } else {
                    alert('Ошибка: ' + result.message);
                }
            } catch (error) {
                console.error('Ошибка при добавлении кредитов:', error);
                alert('Произошла ошибка при добавлении кредитов.');
            }
        });
    }
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            localStorage.removeItem('credits');
            
            window.location.href = 'index.html';
        });
    }

    // Если контейнер заданий существует, запускаем загрузку заданий
    if (tasksContainer) {
        fetchAndDisplayTasks();
    }
    
    async function fetchAndDisplayTasks() {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username })
            });

            if (!response.ok) {
                throw new Error('Не удалось загрузить задания');
            }

            const tasks = await response.json();
            tasksContainer.innerHTML = ''; // Очищаем контейнер

            if (tasks.length === 0) {
                tasksContainer.innerHTML = '<p>Нет доступных заданий.</p>';
            } else {
                tasks.forEach(task => {
                    const taskCard = document.createElement('div');
                    taskCard.classList.add('task-card');

                    let buttonsHtml = '';
                    // Кнопки отображаются только если задание еще не принято
                    // или если оно предназначено конкретному пользователю
                    if (task.status === 'active' && (task.performer === 'All' || task.performer === username)) {
                         buttonsHtml = `
                             <div class="task-actions">
                                 <button class="accept-btn" data-id="${task._id}">Принять</button>
                                 <button class="decline-btn" data-id="${task._id}">Отклонить</button>
                             </div>
                         `;
                    }
                    
                    taskCard.innerHTML = `
                        <h3>${task.taskType}</h3>
                        <p>${task.description}</p>
                        <p>Награда: ${task.reward} R</p>
                        ${buttonsHtml}
                    `;
                    tasksContainer.appendChild(taskCard);
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке заданий:', error);
            tasksContainer.innerHTML = '<p>Ошибка при загрузке заданий.</p>';
        }
    }
    
    // Обработчики для кнопок, добавленные с помощью делегирования событий
    tasksContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('accept-btn')) {
            const taskId = e.target.dataset.id;
            await handleTaskAction('accept', taskId);
        } else if (e.target.classList.contains('decline-btn')) {
            const taskId = e.target.dataset.id;
            if (confirm('Вы уверены, что хотите отклонить это задание?')) {
                await handleTaskAction('decline', taskId);
            }
        }
    });
    
    async function handleTaskAction(action, taskId) {
        try {
            const response = await fetch(`/api/tasks/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: taskId, username: username })
            });
    
            const result = await response.json();
            
            if (!response.ok) {
                alert('Ошибка: ' + result.message);
            } else {
                alert(result.message);
                fetchAndDisplayTasks(); // Перезагружаем список
            }
        } catch (error) {
            console.error(`Ошибка при ${action} задания:`, error);
            alert('Произошла ошибка.');
        }
    }
});