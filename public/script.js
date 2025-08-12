function showPage(pageId) {
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
}

async function checkLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

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
            alert('Вход успешен! Перенаправление на сайт2.');
            window.location.href = 'site2.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Ошибка при авторизации.');
    }
}

async function checkRegister() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (username.trim() !== '' && password.trim() !== '') {
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
                alert('Регистрация прошла успешно! Теперь войдите в систему.');
                showPage('login-page');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Ошибка при регистрации.');
        }
    } else {
        alert('Пожалуйста, введите логин и пароль для регистрации.');
    }
}