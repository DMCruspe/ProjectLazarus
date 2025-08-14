document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const mainPanel = document.getElementById('constructor-main-panel');
    const createTaskBtn = document.getElementById('create-task-btn');
    const createVaccineBtn = document.getElementById('create-vaccine-btn');
    const symptomsBtn = document.getElementById('symptoms-btn');
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

    if (createVaccineBtn) {
        createVaccineBtn.addEventListener('click', loadCreateVaccineForm);
    }

    if (symptomsBtn) {
        symptomsBtn.addEventListener('click', loadSymptomsPanel); // НОВЫЙ ОБРАБОТЧИК
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
                
                <label for="type">Тип:</label>
                <input type="text" id="type" name="type" required>
                
                <label for="symptoms">Симптомы:</label>
                <textarea id="symptoms" name="symptoms" required></textarea>
                
                <label for="spread">Распространение:</label>
                <input type="text" id="spread" name="spread" required>
                
                <label for="resistance">Устойчивость:</label>
                <textarea id="resistance" name="resistance" required></textarea>
                
                <label for="vulnerabilities">Уязвимости:</label>
                <textarea id="vulnerabilities" name="vulnerabilities" required></textarea>
                
                <label for="treatment">Лечение:</label>
                <textarea id="treatment" name="treatment" required></textarea>
                
                <label for="vaccine">Вакцина:</label>
                <input type="text" id="vaccine" name="vaccine">
                
                <button type="submit" class="nav-button">Создать</button>
            </form>
        `;

        document.getElementById('create-disease-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const diseaseData = {
                name: formData.get('name'),
                type: formData.get('type'),
                symptoms: formData.get('symptoms'),
                spread: formData.get('spread'),
                resistance: formData.get('resistance'),
                vulnerabilities: formData.get('vulnerabilities'),
                treatment: formData.get('treatment'),
                vaccine: formData.get('vaccine') // Добавлено новое поле
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

    function loadCreateVaccineForm() {
            mainPanel.innerHTML = `
                <h2>Создание новой вакцины</h2>
                <form id="create-vaccine-form">
                    <label for="name">Название:</label>
                    <input type="text" id="name" name="name" required>
                    
                    <label for="diseaseName">Название Болезни:</label>
                    <input type="text" id="diseaseName" name="diseaseName" required>
                    
                    <label for="dosage">Дозировка:</label>
                    <input type="text" id="dosage" name="dosage" required>
                    
                    <label for="effectiveness">Эффективность (%):</label>
                    <input type="number" id="effectiveness" name="effectiveness" min="0" max="100" required>
                    
                    <label for="sideEffects">Побочные эффекты:</label>
                    <textarea id="sideEffects" name="sideEffects"></textarea>
                    
                    <button type="submit" class="nav-button">Создать</button>
                </form>
            `;

            document.getElementById('create-vaccine-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const vaccineData = {
                    name: formData.get('name'),
                    diseaseName: formData.get('diseaseName'),
                    dosage: formData.get('dosage'),
                    effectiveness: formData.get('effectiveness'),
                    sideEffects: formData.get('sideEffects')
                };

                try {
                    const res = await fetch('/api/vaccine/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(vaccineData)
                    });
                    
                    const result = await res.json();
                    if (res.ok) {
                        alert(result.message);
                        e.target.reset();
                    } else {
                        alert('Ошибка: ' + result.message);
                    }
                } catch (error) {
                    console.error('Ошибка при создании вакцины:', error);
                    alert('Произошла ошибка при создании вакцины.');
                }
            });
        }
    async function loadSymptomsPanel() {
        mainPanel.innerHTML = `
            <h2>Управление симптомами</h2>
            <div id="symptoms-list-container">
                </div>
            <h3>Добавить новый симптом</h3>
            <form id="add-symptom-form">
                <label for="symptom-name">Название симптома:</label>
                <input type="text" id="symptom-name" name="symptomName" required>
                
                <label for="symptom-group">Подгруппа:</label>
                <input type="text" id="symptom-group" name="symptomGroup" required>
                
                <button type="submit" class="nav-button">Добавить</button>
            </form>
        `;

        fetchAndDisplaySymptoms();

        document.getElementById('add-symptom-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const symptomName = form['symptomName'].value;
            const symptomGroup = form['symptomGroup'].value;

            try {
                const response = await fetch('/api/symptom/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: symptomName, subgroup: symptomGroup })
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    form.reset();
                    fetchAndDisplaySymptoms(); // Обновляем список
                } else {
                    alert('Ошибка: ' + result.message);
                }
            } catch (error) {
                console.error('Ошибка при добавлении симптома:', error);
                alert('Произошла ошибка при добавлении симптома.');
            }
        });
        
        mainPanel.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-symptom-btn')) {
                const symptomId = e.target.dataset.id;
                if (confirm('Вы уверены, что хотите удалить этот симптом?')) {
                    try {
                        const response = await fetch('/api/symptom/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: symptomId })
                        });
                        const result = await response.json();
                        if (response.ok) {
                            alert(result.message);
                            fetchAndDisplaySymptoms(); // Обновляем список
                        } else {
                            alert('Ошибка: ' + result.message);
                        }
                    } catch (error) {
                        console.error('Ошибка при удалении симптома:', error);
                        alert('Произошла ошибка при удалении.');
                    }
                }
            }
        });
    }

    async function fetchAndDisplaySymptoms() {
        const symptomsListContainer = document.getElementById('symptoms-list-container');
        try {
            const response = await fetch('/api/symptoms/list');
            const symptoms = await response.json();
            symptomsListContainer.innerHTML = '';
            if (symptoms.length === 0) {
                symptomsListContainer.innerHTML = '<p>Список симптомов пуст.</p>';
            } else {
                symptoms.forEach(symptom => {
                    const symptomCard = document.createElement('div');
                    symptomCard.classList.add('symptom-card');
                    symptomCard.innerHTML = `
                        <h4>${symptom.name}</h4>
                        <p>Подгруппа: ${symptom.subgroup}</p>
                        <button class="delete-symptom-btn" data-id="${symptom._id}">Удалить</button>
                    `;
                    symptomsListContainer.appendChild(symptomCard);
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке списка симптомов:', error);
            symptomsListContainer.innerHTML = '<p>Ошибка при загрузке списка симптомов.</p>';
        }
    }
});

    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', loadCreateTaskForm);
    }
    
    if (createVaccineBtn) {
        createVaccineBtn.addEventListener('click', loadCreateVaccineForm);
    }

    // Добавляем обработчик для новой кнопки
    if (createDiseaseBtn) {
        createDiseaseBtn.addEventListener('click', loadCreateDiseaseForm);
    }
});