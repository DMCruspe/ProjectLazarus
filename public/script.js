// This is a simple object acting as a "database"
const usersDB = {};

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(page => page.classList.remove('active'));

    // Show the desired page
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
}

function checkLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (usersDB[username] && usersDB[username] === password) {
        // User exists and password matches
        window.location.href = 'site2.html';
    } else {
        alert('Неверный логин или пароль.');
    }
}

function checkRegister() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (username.trim() !== '' && password.trim() !== '') {
        if (usersDB[username]) {
            alert('Пользователь с таким именем уже существует.');
        } else {
            // "Save" the user to the "database"
            usersDB[username] = password;
            showPage('success-page');
        }
    } else {
        alert('Пожалуйста, введите логин и пароль для регистрации.');
    }
}