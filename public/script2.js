document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const welcomeMessageElement = document.getElementById('welcome-message');

    if (username) {
        // ИЗМЕНЕНО: теперь сообщение не содержит роль
        welcomeMessageElement.textContent = `Добро пожаловать, ${username}!`;
    } else {
        window.location.href = 'index.html';
    }

    // Проверяем роль и показываем кнопки для администраторов
    const playersButton = document.getElementById('players-button');
    const constructorButton = document.getElementById('constructor-button');

    if (role === 'admin' || role === 'superadmin') {
        if (playersButton) {
            playersButton.style.display = 'block';
        }
        if (constructorButton) {
            constructorButton.style.display = 'block';
        }
    }
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            
            window.location.href = 'index.html';
        });
    }
});