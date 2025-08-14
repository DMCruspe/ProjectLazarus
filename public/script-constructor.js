document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const mainPanel = document.getElementById('constructor-main-panel');
    const createTaskBtn = document.getElementById('create-task-btn');
    const createVaccineBtn = document.getElementById('create-vaccine-btn');
    const symptomsBtn = document.getElementById('symptoms-btn');
    const createDiseaseBtn = document.getElementById('create-disease-btn');
    const backButton = document.getElementById('back-to-main');

    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }
    
    // Проверка прав доступа
    if (role !== 'admin' && role !== 'superadmin') {
        alert('Доступ запрещён.');
        window.location.href = 'site2.html';
        return;
    }
    
    // Все обработчики кнопок должны быть внутри DOMContentLoaded
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', loadCreateTaskForm);
    }
    
    if (createVaccineBtn) {
        createVaccineBtn.addEventListener('click', loadCreateVaccineForm);
    }

    if (symptomsBtn) {
        symptomsBtn.addEventListener('click', loadSymptomsPanel);
    }
    
    if (createDiseaseBtn) {
        createDiseaseBtn.addEventListener('click', loadCreateDiseaseForm);
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
                    <div class="form-row">
                        <label for="title">Название задания:</label>
                        <input type="text" id="title" name="title" required>
                    </div>
                    
                    <div class="form-row">
                        <label for="taskType">Вид задания:</label>
                        <select id="taskType" name="taskType" required>
                            <option value="изучение болезни">Изучение болезни</option>
                            <option value="изучение территории">Изучение территории</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <label for="description">Описание:</label>
                        <textarea id="description" name="description" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <label for="reward">Награда (R):</label>
                        <input type="number" id="reward" name="reward" min="0" required>
                    </div>
                    
                    <div class="form-row">
                        <label for="performer">Исполнитель:</label>
                        <select id="performer" name="performer">
                            ${options}
                        </select>
                    </div>
                    
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

    function loadCreateDiseaseForm() {
        mainPanel.innerHTML = `
            <h2>Создание новой болезни</h2>
            <form id="create-disease-form">
                <div class="form-row">
                    <label for="name">Название:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-row">
                    <label for="type">Тип:</label>
                    <select id="type" name="type" required>
                        <option value="вирус">Вирус</option>
                        <option value="бактерия">Бактерия</option>
                        <option value="грибок">Грибок</option>
                        <option value="паразит">Паразит</option>
                        <option value="прион">Прион</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <label for="symptoms">Симптомы:</label>
                    <textarea id="symptoms" name="symptoms" required></textarea>
                </div>
                
                <div class="form-row">
                    <label for="spread">Распространение:</label>
                    <input type="text" id="spread" name="spread" required>
                </div>
                
                <div class="form-row">
                    <label for="resistance">Устойчивость:</label>
                    <textarea id="resistance" name="resistance" required></textarea>
                </div>
                
                <div class="form-row">
                    <label for="vulnerabilities">Уязвимости:</label>
                    <textarea id="vulnerabilities" name="vulnerabilities" required></textarea>
                </div>
                
                <div class="form-row">
                    <label for="treatment">Лечение:</label>
                    <textarea id="treatment" name="treatment" required></textarea>
                </div>
                
                <div class="form-row">
                    <label for="vaccine">Вакцина:</label>
                    <input type="text" id="vaccine" name="vaccine">
                </div>
                
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
                vaccine: formData.get('vaccine')
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
                <div class="form-row">
                    <label for="name">Название:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-row">
                    <label for="diseaseName">Название Болезни:</label>
                    <input type="text" id="diseaseName" name="diseaseName" required>
                </div>
                
                <div class="form-row">
                    <label for="dosage">Дозировка:</label>
                    <input type="text" id="dosage" name="dosage" required>
                </div>
                
                <div class="form-row">
                    <label for="effectiveness">Эффективность (%):</label>
                    <input type="number" id="effectiveness" name="effectiveness" min="0" max="100" required>
                </div>
                
                <div class="form-row">
                    <label for="sideEffects">Побочные эффекты:</label>
                    <textarea id="sideEffects" name="sideEffects"></textarea>
                </div>
                
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
                <div class="form-row">
                    <label for="symptom-name">Название симптома:</label>
                    <input type="text" id="symptom-name" name="symptomName" required>
                </div>
                
                <div class="form-row">
                    <label for="symptom-group">Подгруппа:</label>
                    <input type="text" id="symptom-group" name="symptomGroup" required>
                </div>
                
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
                // 1. Группируем симптомы по подгруппам
                const groupedSymptoms = symptoms.reduce((groups, symptom) => {
                    const group = symptom.subgroup || 'Без подгруппы';
                    if (!groups[group]) {
                        groups[group] = [];
                    }
                    groups[group].push(symptom);
                    return groups;
                }, {});

                // 2. Получаем отсортированные названия подгрупп
                const sortedGroups = Object.keys(groupedSymptoms).sort();

                // 3. Отображаем симптомы по отсортированным подгруппам
                sortedGroups.forEach(groupName => {
                    // Создаем заголовок для подгруппы
                    const groupTitle = document.createElement('h3');
                    groupTitle.textContent = groupName;
                    symptomsListContainer.appendChild(groupTitle);
                    
                    // Сортируем симптомы внутри подгруппы по названию
                    const sortedGroupSymptoms = groupedSymptoms[groupName].sort((a, b) => a.name.localeCompare(b.name));

                    // Создаем и добавляем карточки симптомов
                    sortedGroupSymptoms.forEach(symptom => {
                        const symptomCard = document.createElement('div');
                        symptomCard.classList.add('symptom-card');
                        symptomCard.innerHTML = `
                            <h4>${symptom.name}</h4>
                            <button class="delete-symptom-btn" data-id="${symptom._id}">Удалить</button>
                        `;
                        symptomsListContainer.appendChild(symptomCard);
                    });
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке списка симптомов:', error);
            symptomsListContainer.innerHTML = '<p>Ошибка при загрузке списка симптомов.</p>';
        }
    }
});