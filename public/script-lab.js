document.addEventListener('DOMContentLoaded', () => {
    // Получаем баланс из localStorage
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');

    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    // Обработчик для кнопки "Назад"
    const backButton = document.getElementById('back-to-main');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }
});