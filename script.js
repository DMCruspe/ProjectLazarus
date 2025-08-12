function showPage(pageId) {
    // Скрываем все страницы
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(page => page.classList.remove('active'));

    // Показываем нужную страницу
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
}

function checkLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username.trim() !== '' && password.trim() !== '') {
        // Условие выполнено, можно переходить на следующий сайт
        window.location.href = 'site2.html';
    } else {
        alert('Пожалуйста, введите логин и пароль.');
    }
}

function checkRegister() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (username.trim() !== '' && password.trim() !== '') {
        // Условие выполнено, показываем страницу успеха
        showPage('success-page');
    } else {
        alert('Пожалуйста, введите логин и пароль для регистрации.');
    }
}