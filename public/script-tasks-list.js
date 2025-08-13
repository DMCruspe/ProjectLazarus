document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const tableBody = document.querySelector('#tasks-table tbody');

    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    const backButton = document.getElementById('back-to-main');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    if (role === 'admin' || role === 'superadmin') {
        fetchTasks();
    } else {
        alert('Доступ запрещён.');
        window.location.href = 'site2.html';
    }

    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterUsername: username })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            
            const tasks = await response.json();
            tableBody.innerHTML = '';
            
            tasks.forEach(task => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = new Date(task.createdAt).toLocaleString();
                row.insertCell(1).textContent = task.title;
                row.insertCell(2).textContent = task.taskType;
                row.insertCell(3).textContent = task.description;
                row.insertCell(4).textContent = task.reward;
                row.insertCell(5).textContent = task.performer;
                row.insertCell(6).textContent = task.status;

                const actionsCell = row.insertCell(7);
                const completeBtn = document.createElement('button');
                completeBtn.textContent = 'Выполнено';
                completeBtn.addEventListener('click', () => completeTask(task._id));
                actionsCell.appendChild(completeBtn);

                const changePerformerBtn = document.createElement('button');
                changePerformerBtn.textContent = 'Сменить исполнителя';
                changePerformerBtn.addEventListener('click', () => changePerformer(task._id));
                actionsCell.appendChild(changePerformerBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Удалить';
                deleteBtn.addEventListener('click', () => deleteTask(task._id));
                actionsCell.appendChild(deleteBtn);
            });
        } catch (error) {
            console.error('Ошибка при загрузке заданий:', error);
            alert('Ошибка при загрузке заданий: ' + error.message);
        }
    }

    async function completeTask(taskId) {
        if (confirm('Вы уверены, что хотите отметить задание как выполненное?')) {
            try {
                const response = await fetch('/api/tasks/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId, requesterUsername: username })
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    fetchTasks();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Ошибка при выполнении задания:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    }

    async function changePerformer(taskId) {
        const newPerformer = prompt('Введите имя нового исполнителя:');
        if (newPerformer) {
            try {
                const response = await fetch('/api/tasks/change-performer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId, newPerformer, requesterUsername: username })
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    fetchTasks();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Ошибка при смене исполнителя:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    }

    async function deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить это задание?')) {
            try {
                const response = await fetch('/api/tasks/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId, requesterUsername: username })
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    fetchTasks();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Ошибка при удалении задания:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    }
});