document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const playersTable = document.getElementById('players-table');
    const tableBody = playersTable.querySelector('tbody');
    const panelTitle = document.getElementById('panel-title');

    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    const backButton = document.getElementById('back-to-main');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    const authorizedAccountsBtn = document.getElementById('authorized-accounts-btn');
    const unauthorizedAccountsBtn = document.getElementById('unauthorized-accounts-btn');
    
    // Добавляем обработчики для новых кнопок
    if (authorizedAccountsBtn) {
        authorizedAccountsBtn.addEventListener('click', () => {
            panelTitle.textContent = 'Авторизованные аккаунты';
            fetchAuthorizedPlayers();
        });
    }

    if (unauthorizedAccountsBtn) {
        unauthorizedAccountsBtn.addEventListener('click', () => {
            panelTitle.textContent = 'Не авторизованные аккаунты';
            fetchUnauthorizedPlayers();
        });
    }

    if (role === 'admin' || role === 'superadmin') {
        fetchAuthorizedPlayers(); // Загружаем авторизованные аккаунты по умолчанию
    } else {
        alert('Доступ запрещён.');
        window.location.href = 'site2.html';
    }

    async function fetchAuthorizedPlayers() {
        try {
            // Обновляем заголовок таблицы
            playersTable.querySelector('thead').innerHTML = `
                <tr>
                    <th>Логин</th>
                    <th>Роль</th>
                    <th>Баланс (R)</th>
                    <th>Действия</th>
                </tr>
            `;

            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                    const toggleRoleBtn = document.createElement('button');
                    toggleRoleBtn.textContent = 'Сменить роль';
                    toggleRoleBtn.classList.add('action-btn');
                    toggleRoleBtn.addEventListener('click', () => toggleRole(player.username, player.role));
                    actionsCell.appendChild(toggleRoleBtn);

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

    // Новая функция для получения и отображения НЕ АВТОРИЗОВАННЫХ аккаунтов
    async function fetchUnauthorizedPlayers() {
        try {
            // Обновляем заголовок таблицы для неавторизованных аккаунтов
            playersTable.querySelector('thead').innerHTML = `
                <tr>
                    <th>Дата запроса</th>
                    <th>Логин</th>
                    <th>Действия</th>
                </tr>
            `;

            const response = await fetch('/api/unauthorized-players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterUsername: username })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const unauthorizedPlayers = await response.json();
            
            tableBody.innerHTML = '';
            
            if (unauthorizedPlayers.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3">Список не авторизованных аккаунтов пуст.</td></tr>';
            } else {
                unauthorizedPlayers.forEach(player => {
                    const row = tableBody.insertRow();
                    row.insertCell(0).textContent = new Date(player.requestDate).toLocaleString(); // Отображаем дату в читаемом формате
                    row.insertCell(1).textContent = player.username;
                    
                    const actionsCell = row.insertCell(2);

                    const authorizeBtn = document.createElement('button');
                    authorizeBtn.textContent = 'Авторизовать';
                    authorizeBtn.classList.add('action-btn');
                    authorizeBtn.addEventListener('click', () => authorizeAccount(player.username));
                    actionsCell.appendChild(authorizeBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Удалить';
                    deleteBtn.classList.add('action-btn', 'delete-btn');
                    deleteBtn.addEventListener('click', () => deleteUnauthorizedAccount(player.username));
                    actionsCell.appendChild(deleteBtn);
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке неавторизованных аккаунтов:', error);
            alert('Ошибка при загрузке данных: ' + error.message);
        }
    }
    
    async function updateCredits(targetUsername, amount) {
        try {
            const response = await fetch('/api/players/update-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterUsername: username, targetUsername, amount })
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: username, targetUsername, newRole })
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: username, targetUsername })
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
    }

    // Новые функции для управления неавторизованными аккаунтами
    async function authorizeAccount(targetUsername) {
        if (confirm(`Вы уверены, что хотите авторизовать аккаунт ${targetUsername}?`)) {
            try {
                const response = await fetch('/api/authorize-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: username, targetUsername })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }

                alert(`Аккаунт ${targetUsername} успешно авторизован.`);
                fetchUnauthorizedPlayers(); // Перезагружаем список
            } catch (error) {
                console.error('Ошибка при авторизации аккаунта:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    }

    async function deleteUnauthorizedAccount(targetUsername) {
        if (confirm(`Вы уверены, что хотите удалить запрос на авторизацию для аккаунта ${targetUsername}?`)) {
            try {
                const response = await fetch('/api/delete-unauthorized-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterUsername: username, targetUsername })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }

                alert(`Запрос на авторизацию для аккаунта ${targetUsername} успешно удалён.`);
                fetchUnauthorizedPlayers(); // Перезагружаем список
            } catch (error) {
                console.error('Ошибка при удалении запроса на авторизацию:', error);
                alert('Ошибка: ' + error.message);
            }
        }
    }
});