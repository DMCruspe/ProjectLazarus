document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const mainPanel = document.getElementById('constructor-main-panel');
    const createTaskBtn = document.getElementById('create-task-btn');
    const createVaccineBtn = document.getElementById('create-vaccine-btn');
    const createDiseaseBtn = document.getElementById('create-disease-btn'); // Новая кнопка
    
    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    const backButton = document.getElementById('back-to-main');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    // Проверка прав доступа
    if (role !== 'admin' && role !== 'superadmin') {
        alert('Доступ запрещён.');
        window.location.href = 'site2.html';
        return;
    }

    async function loadCreateTaskForm() {
        try {
            // Получаем список игроков для выпадающего списка
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterUsername: username })
            });
            const players = await response.json();
            
            // Формируем опции для выпадающего списка
            let options = '<option value="All">Все</option>';
            players.forEach(p => {
                options += `<option value="${p.username}">${p.username}</option>`;
            });

            // Форма создания задания с новым полем "Название задания"
            mainPanel.innerHTML = `
                <h2>Создание нового задания</h2>
                <form id="create-task-form">
                    <label for="title">Название задания:</label>
                    <input type="text" id="title" name="title" required>
                    
                    <label for="taskType">Вид задания:</label>
                    <input type="text" id="taskType" name="taskType" required>
                    
                    <label for="description">Описание:</label>
                    <textarea id="description" name="description" required></textarea>
                    
                    <label for="reward">Награда (R):</label>
                    <input type="number" id="reward" name="reward" min="0" required>
                    
                    <label for="performer">Исполнитель:</label>
                    <select id="performer" name="performer">
                        ${options}
                    </select>
                    
                    <button type="submit" class="nav-button">Создать</button>
                </form>
            `;
            
            // Обработчик отправки формы
            document.getElementById('create-task-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const taskData = {
                    requesterUsername: username,
                    title: formData.get('title'),
                    taskType: formData.get('taskType'),
                    description: formData.get('description'),
                    reward: parseInt(formData.get('reward')),
                    performer: formData.get('performer')
                };

                try {
                    const res = await fetch('/api/tasks/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(taskData)
                    });
                    
                    const result = await res.json();
                    if (res.ok) {
                        alert(result.message);
                        e.target.reset(); // Очищаем форму
                    } else {
                        alert('Ошибка: ' + result.message);
                    }
                } catch (error) {
                    console.error('Ошибка при создании задания:', error);
                    alert('Произошла ошибка при создании задания.');
                }
            });

        } catch (error) {
            console.error('Ошибка при загрузке формы:', error);
            mainPanel.innerHTML = '<p>Ошибка при загрузке формы. Попробуйте снова.</p>';
        }
    }

    // Новая функция для создания формы болезни
    function loadCreateDiseaseForm() {
        mainPanel.innerHTML = `
            <h2>Создание новой болезни</h2>
            <form id="create-disease-form">
                <label for="name">Название:</label>
                <input type="text" id="name" name="name" required>
                
                <label for="description">Описание:</label>
                <textarea id="description" name="description" required></textarea>
                
                <label for="spreadFactor">Коэффициент распространения:</label>
                <input type="number" id="spreadFactor" name="spreadFactor" min="0" step="0.1" required>
                
                <label for="lethality">Летальность (%):</label>
                <input type="number" id="lethality" name="lethality" min="0" max="100" required>
                
                <button type="submit" class="nav-button">Создать</button>
            </form>
        `;

        document.getElementById('create-disease-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const diseaseData = {
                name: formData.get('name'),
                description: formData.get('description'),
                spreadFactor: parseFloat(formData.get('spreadFactor')),
                lethality: parseInt(formData.get('lethality'))
            };

            try {
                const res = await fetch('/api/disease/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(diseaseData)
                });
                
                const result = await res.json();
                if (res.ok) {
                    alert(result.message);
                    e.target.reset();
                } else {
                    alert('Ошибка: ' + result.message);
                }
            } catch (error) {
                console.error('Ошибка при создании болезни:', error);
                alert('Произошла ошибка при создании болезни.');
            }
        });
    }

    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', loadCreateTaskForm);
    }
    
    if (createVaccineBtn) {
        createVaccineBtn.addEventListener('click', () => {
            mainPanel.innerHTML = '<h2>Создание новой вакцины</h2><p>...Форма здесь...</p>';
        });
    }

    // Добавляем обработчик для новой кнопки
    if (createDiseaseBtn) {
        createDiseaseBtn.addEventListener('click', loadCreateDiseaseForm);
    }
});