document.addEventListener('DOMContentLoaded', () => {
    // Получаем имя пользователя из localStorage при загрузке страницы
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('welcome-message').textContent = `Добро пожаловать, ${username}`;
    } else {
        // Если имя пользователя не найдено, перенаправляем на страницу входа
        window.location.href = 'index.html';
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Удаляем имя пользователя из localStorage
            localStorage.removeItem('username');
            
            // Перенаправляем на страницу входа
            window.location.href = 'index.html';
        });
    }
});