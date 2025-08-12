function showPage(pageId) {
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
    // Очистка полей ввода и сообщений при смене страницы
    clearFormFields(pageId);
    clearMessages();
}

function clearFormFields(pageId) {
    if (pageId === 'login-page') {
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    } else if (pageId === 'register-page') {
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
    }
}

function showMessage(pageId, message, isError = false) {
    const messageElement = document.getElementById(`${pageId.split('-')[0]}-message`);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = isError ? 'red' : 'green';
    }
}

function clearMessages() {
    const messages = document.querySelectorAll('.message-area');
    messages.forEach(msg => {
        msg.textContent = '';
    });
}

async function checkLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username.trim() === '' || password.trim() === '') {
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

async function checkRegister() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (username.trim() === '' || password.trim() === '') {
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
            showMessage('register-page', 'Регистрация прошла успешно!', false);
            // Показываем страницу успеха
            showPage('success-page');
        } else {
            showMessage('register-page', result.message, true);
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        showMessage('register-page', 'Ошибка при регистрации. Попробуйте ещё раз.', true);
    }
}