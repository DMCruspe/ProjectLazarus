// Функция для показа/скрытия страниц
function showPage(pageId) {
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(page => page.classList.remove('active'));

    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
}

// Функция для очистки сообщений
function clearMessages() {
    const messages = document.querySelectorAll('.message-area');
    messages.forEach(msg => {
        msg.textContent = '';
    });
}

// Функция для вывода сообщений пользователю
function showMessage(pageId, message, isError = false) {
    const messageElement = document.getElementById(`${pageId.split('-')[0]}-message`);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = isError ? 'red' : 'green';
    }
}

// Функция для авторизации
async function checkLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showMessage('login-page', 'Пожалуйста, введите логин и пароль.', true);
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('username', result.username);
            window.location.href = 'site2.html';
        } else {
            showMessage('login-page', result.message, true);
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
        showMessage('login-page', 'Ошибка при входе. Попробуйте ещё раз.', true);
    }
}

// Функция для регистрации
async function checkRegister() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        showMessage('register-page', 'Пожалуйста, введите логин и пароль для регистрации.', true);
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            // Если регистрация успешна, показываем страницу "success-page"
            showPage('success-page');
        } else {
            showMessage('register-page', result.message, true);
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        showMessage('register-page', 'Ошибка при регистрации. Попробуйте ещё раз.', true);
    }
}

// Добавляем обработчики событий после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Главная страница
    document.getElementById('login-btn').addEventListener('click', () => showPage('login-page'));
    document.getElementById('register-btn').addEventListener('click', () => showPage('register-page'));

    // Страница входа
    document.getElementById('login-submit-btn').addEventListener('click', checkLogin);
    document.getElementById('login-back-btn').addEventListener('click', () => showPage('main-page'));

    // Страница регистрации
    document.getElementById('register-submit-btn').addEventListener('click', checkRegister);
    document.getElementById('register-back-btn').addEventListener('click', () => showPage('main-page'));

    // Страница успеха
    document.getElementById('success-to-login-btn').addEventListener('click', () => showPage('login-page'));
});