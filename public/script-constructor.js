document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');

    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    const backButton = document.getElementById('back-to-main');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    // Здесь будет логика для кнопок "Создать задание" и "Создать вакцину"
    const createTaskBtn = document.getElementById('create-task-btn');
    const createVaccineBtn = document.getElementById('create-vaccine-btn');
    const mainPanel = document.querySelector('.constructor-panel');
    const welcomeMessage = document.getElementById('constructor-welcome-message');

    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', () => {
            // Загрузка формы создания задания
            welcomeMessage.textContent = 'Создание нового задания';
            mainPanel.innerHTML = '<h2>Создание нового задания</h2><p>...Форма здесь...</p>';
        });
    }
    
    if (createVaccineBtn) {
        createVaccineBtn.addEventListener('click', () => {
            // Загрузка формы создания вакцины
            welcomeMessage.textContent = 'Создание новой вакцины';
            mainPanel.innerHTML = '<h2>Создание новой вакцины</h2><p>...Форма здесь...</p>';
        });
    }

    // Проверка прав доступа
    if (role !== 'admin' && role !== 'superadmin') {
        alert('Доступ запрещён.');
        window.location.href = 'site2.html';
    }
});