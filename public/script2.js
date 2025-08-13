document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    
    const welcomeMessageElement = document.getElementById('welcome-message');
    const creditsElement = document.getElementById('credits');
    const addCreditsButton = document.getElementById('add-credits-btn');
    const tasksContainer = document.getElementById('tasks-list-container');
    const tasksListButton = document.getElementById('tasks-list-button');
    
    // Новые элементы для принятых заданий
    const acceptedTask1 = document.getElementById('accepted-task-1');
    const acceptedTask2 = document.getElementById('accepted-task-2');

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
        if (tasksListButton) {
            tasksListButton.style.display = 'block';
            tasksListButton.addEventListener('click', () => {
                window.location.href = 'tasks-list.html';
            });
        }
    }
    
    // Показываем кнопку "+" только для superadmin
    if (role === 'superadmin' && addCreditsButton) {
        addCreditsButton.style.display = 'block';
        
        addCreditsButton.addEventListener('click', async () => {
            const amountToAdd = 100;
            
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
            
            // Очищаем контейнеры
            tasksContainer.innerHTML = '';
            acceptedTask1.innerHTML = '<p class="placeholder-text">Задание не принято</p>';
            acceptedTask2.innerHTML = '<p class="placeholder-text">Задание не принято</p>';

            const activeTasks = tasks.filter(task => task.status === 'active');
            const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
            
            // Отображаем принятые задания в центральной панели
            if (inProgressTasks.length > 0) {
                acceptedTask1.innerHTML = `
                    <h3>${inProgressTasks[0].title}</h3>
                    <p>${inProgressTasks[0].description}</p>
                    <p>Награда: ${inProgressTasks[0].reward} R</p>
                `;
            }
            if (inProgressTasks.length > 1) {
                acceptedTask2.innerHTML = `
                    <h3>${inProgressTasks[1].title}</h3>
                    <p>${inProgressTasks[1].description}</p>
                    <p>Награда: ${inProgressTasks[1].reward} R</p>
                `;
            }
            
            // Отображаем доступные задания в правой панели
            if (activeTasks.length === 0) {
                tasksContainer.innerHTML = '<p>Нет доступных заданий.</p>';
            } else {
                activeTasks.forEach(task => {
                    const taskCard = document.createElement('div');
                    taskCard.classList.add('task-card');

                    let buttonsHtml = '';
                    if (task.performer === 'All' || task.performer === username) {
                         buttonsHtml = `
                             <div class="task-actions">
                                 <button class="accept-btn" data-id="${task._id}">Принять</button>
                             </div>
                         `;
                    }
                    
                    taskCard.innerHTML = `
                        <h3>${task.title}</h3>
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
            // Добавлена проверка перед отправкой запроса на сервер
            const acceptedTasks = await fetchAcceptedTasks();
            if (acceptedTasks.length >= 2) {
                 alert('Вы уже приняли максимально возможное количество заданий.');
                 return;
            }
            await handleTaskAction('accept', taskId);
        }
    });

    // Новая вспомогательная функция для получения принятых заданий
    async function fetchAcceptedTasks() {
        try {
             const response = await fetch('/api/tasks', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ username: username })
             });
             const tasks = await response.json();
             return tasks.filter(task => task.status === 'in_progress');
        } catch (error) {
             console.error('Ошибка при получении принятых заданий:', error);
             return [];
        }
    }
    
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