document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен и готов к работе!');

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