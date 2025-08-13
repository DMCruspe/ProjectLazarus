document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const tableBody = document.querySelector('#players-table tbody');
    const playersPanel = document.querySelector('.players-panel');

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
        fetchPlayers();
    } else {
        alert('Доступ запрещён.');
        window.location.href = 'site2.html';
    }

    async function fetchPlayers() {
        try {
            // Отправляем GET-запрос на сервер для получения списка игроков
            // В теле запроса передаем имя текущего пользователя для проверки роли на сервере
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requesterUsername: username })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const players = await response.json();
            
            tableBody.innerHTML = ''; // Очищаем таблицу перед заполнением
            players.forEach(player => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = player.username;
                
                const roleCell = row.insertCell(1);
                roleCell.textContent = player.role;

                const creditsCell = row.insertCell(2);
                creditsCell.textContent = player.credits;

                const actionsCell = row.insertCell(3);

                // Кнопка для изменения кредитов
                const addCreditsBtn = document.createElement('button');
                addCreditsBtn.textContent = 'Добавить R';
                addCreditsBtn.classList.add('action-btn');
                addCreditsBtn.addEventListener('click', () => {
                    const amount = prompt('Введите количество кредитов для добавления:', 100);
                    if (amount && !isNaN(amount)) {
                        updateCredits(player.username, parseInt(amount, 10));
                    }
                });
                actionsCell.appendChild(addCreditsBtn);

                if (role === 'superadmin') {
                    // Кнопка для изменения роли
                    const toggleRoleBtn = document.createElement('button');
                    toggleRoleBtn.textContent = 'Сменить роль';
                    toggleRoleBtn.classList.add('action-btn');
                    toggleRoleBtn.addEventListener('click', () => toggleRole(player.username, player.role));
                    actionsCell.appendChild(toggleRoleBtn);

                    // Кнопка для удаления аккаунта
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Удалить';
                    deleteBtn.classList.add('action-btn', 'delete-btn');
                    deleteBtn.addEventListener('click', () => deleteAccount(player.username));
                    actionsCell.appendChild(deleteBtn);
                }
            });
        } catch (error) {
            console.error('Ошибка при загрузке игроков:', error);
            alert('Ошибка при загрузке данных: ' + error.message);
        }
    }
    
    // Функции для взаимодействия с API
    async function updateCredits(targetUsername, amount) {
        try {
            const response = await fetch('/api/players/update-credits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requesterUsername: username, targetUsername, amount })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            
            alert(`Баланс пользователя ${targetUsername} успешно обновлен.`);
            fetchPlayers(); // Перезагружаем список игроков для отображения изменений
        } catch (error) {
            console.error('Ошибка при обновлении баланса:', error);
            alert('Ошибка: ' + error.message);
        }
    }

    async function toggleRole(targetUsername, currentRole) {
        if (targetUsername === username) {
            alert('Вы не можете изменить свою собственную роль.');
            return;
        }
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (confirm(`Вы уверены, что хотите сменить роль пользователя ${targetUsername} на "${newRole}"?`)) {
            try {
                const response = await fetch('/api/players/toggle-role', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ requesterUsername: username, targetUsername, newRole })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }

                alert(`Роль пользователя ${targetUsername} успешно изменена на "${newRole}".`);
                fetchPlayers(); // Перезагружаем список
            } catch (error) {
                console.error('Ошибка при смене роли:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    }

    async function deleteAccount(targetUsername) {
        if (targetUsername === username) {
            alert('Вы не можете удалить свой собственный аккаунт.');
            return;
        }
        if (confirm(`Вы уверены, что хотите удалить аккаунт ${targetUsername}? Это действие необратимо.`)) {
            try {
                const response = await fetch('/api/players/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ requesterUsername: username, targetUsername })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }

                alert(`Аккаунт ${targetUsername} успешно удалён.`);
                fetchPlayers(); // Перезагружаем список
            } catch (error) {
                console.error('Ошибка при удалении аккаунта:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    }
});