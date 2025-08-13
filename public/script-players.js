document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const tableBody = document.querySelector('#players-table tbody');

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
            const response = await fetch('/api/players');
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
                addCreditsBtn.addEventListener('click', () => updateCredits(player.username, 100));
                actionsCell.appendChild(addCreditsBtn);

                if (role === 'superadmin') {
                    // Кнопка для изменения роли
                    const toggleRoleBtn = document.createElement('button');
                    toggleRoleBtn.textContent = 'Сменить роль';
                    toggleRoleBtn.addEventListener('click', () => toggleRole(player.username, player.role));
                    actionsCell.appendChild(toggleRoleBtn);

                    // Кнопка для удаления аккаунта
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Удалить';
                    deleteBtn.addEventListener('click', () => deleteAccount(player.username));
                    actionsCell.appendChild(deleteBtn);
                }
            });
        } catch (error) {
            console.error('Ошибка при загрузке игроков:', error);
        }
    }
    
    // Функции для взаимодействия с API
    async function updateCredits(targetUsername, amount) {
        // ... Логика отправки запроса на сервер
        console.log(`Обновляем баланс для ${targetUsername} на ${amount}`);
        // После успешного ответа сервера, обновить таблицу:
        // fetchPlayers(); 
    }

    async function toggleRole(targetUsername, currentRole) {
        // ... Логика отправки запроса на сервер
        console.log(`Меняем роль для ${targetUsername}`);
        // После успешного ответа сервера, обновить таблицу:
        // fetchPlayers();
    }

    async function deleteAccount(targetUsername) {
        // ... Логика отправки запроса на сервер
        if (confirm(`Вы уверены, что хотите удалить аккаунт ${targetUsername}?`)) {
            console.log(`Удаляем аккаунт ${targetUsername}`);
            // После успешного ответа сервера, обновить таблицу:
            // fetchPlayers();
        }
    }
});