document.addEventListener('DOMContentLoaded', () => {
    // Получаем имя пользователя из localStorage
    const username = localStorage.getItem('username');
    const welcomeMessageElement = document.getElementById('welcome-message');

    // Если имя пользователя найдено, отображаем приветственное сообщение
    if (username) {
        welcomeMessageElement.textContent = `Добро пожаловать, ${username}!`;
    } else {
        // Если имя пользователя не найдено (т.е. пользователь не авторизован),
        // перенаправляем его на главную страницу
        window.location.href = 'index.html';
    }

    // Обработчик события для кнопки "Выйти"
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // 1. Очищаем данные из localStorage
            localStorage.removeItem('username');
            
            // 2. Перенаправляем пользователя на index.html
            window.location.href = 'index.html';
        });
    }
});