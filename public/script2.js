document.addEventListener('DOMContentLoaded', () => {
    // Получаем имя пользователя и роль из localStorage
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const welcomeMessageElement = document.getElementById('welcome-message');

    if (username) {
        welcomeMessageElement.textContent = `Добро пожаловать, ${username}! Ваша роль: ${role}`;
    } else {
        window.location.href = 'index.html';
    }

    // Проверяем роль и показываем кнопку "Игроки"
    const playersButton = document.getElementById('players-button');
    if (playersButton && (role === 'admin' || role === 'superadmin')) {
        playersButton.style.display = 'block'; // Показываем кнопку
    }
    
    // Обработчик события для кнопки "Выйти"
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Очищаем данные из localStorage
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            
            // Перенаправляем пользователя на index.html
            window.location.href = 'index.html';
        });
    }
});