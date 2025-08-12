document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен и готов к работе!');

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Перенаправление на страницу index.html
            window.location.href = 'index.html';
        });
    }
    // Здесь можно добавить логику для кнопок навигации,
    // например, переключение между страницами или отображение/скрытие блоков.

    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Нажата кнопка: ${button.textContent}`);
            // Ваша логика для навигации здесь
        });
    });
});