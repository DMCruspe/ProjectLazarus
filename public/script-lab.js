document.addEventListener('DOMContentLoaded', () => {
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const backButton = document.getElementById('back-to-main');
    
    // Элементы игры
    const startResearchBtn = document.getElementById('start-research-btn');
    const researchResultsContainer = document.getElementById('research-results-container');
    const userInputSection = document.getElementById('user-input-section');
    const symptomInput = document.getElementById('symptom-input');
    const checkSymptomsBtn = document.getElementById('check-symptoms-btn');
    const gameFeedback = document.getElementById('game-feedback');
    const repeatResearchBtn = document.getElementById('repeat-research-btn');
    
    let allSymptoms = [];
    let correctSymptoms = [];
    
    async function fetchAllSymptoms() {
        try {
            const response = await fetch('/api/symptoms/list');
            allSymptoms = await response.json();
            // Заранее определяем "правильные" симптомы
            correctSymptoms = getCorrectSymptoms();
        } catch (error) {
            console.error('Ошибка при загрузке симптомов:', error);
        }
    }
    
    fetchAllSymptoms();

    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    if (startResearchBtn) {
        startResearchBtn.addEventListener('click', () => {
            startResearchBtn.disabled = true;
            researchResultsContainer.innerHTML = '';
            gameFeedback.innerHTML = '';
            userInputSection.style.display = 'none';
            repeatResearchBtn.style.display = 'none';
            
            // Запускаем 3 исследования с интервалом
            let researchCount = 0;
            const interval = setInterval(() => {
                researchCount++;
                const newSymptoms = generateSymptomsForResearch();
                displayResearchResult(researchCount, newSymptoms);
                
                if (researchCount >= 3) { // Проводим 3 исследования
                    clearInterval(interval);
                    userInputSection.style.display = 'block';
                }
            }, 5000); // Интервал в 5 секунд
        });
    }

    if (repeatResearchBtn) {
        repeatResearchBtn.addEventListener('click', () => {
            startResearchBtn.disabled = false;
            repeatResearchBtn.style.display = 'none';
            researchResultsContainer.innerHTML = '';
            userInputSection.style.display = 'none';
            gameFeedback.innerHTML = '';
            symptomInput.value = '';
            correctSymptoms = getCorrectSymptoms(); // Генерируем новый правильный набор
        });
    }
    
    if (checkSymptomsBtn) {
        checkSymptomsBtn.addEventListener('click', () => {
            const userSymptoms = symptomInput.value.split(',').map(s => s.trim()).filter(s => s);
            
            if (userSymptoms.length !== 3) {
                gameFeedback.innerHTML = `<p style="color:red;">Пожалуйста, введите ровно 3 симптома через запятую.</p>`;
                return;
            }

            const correctNames = correctSymptoms.map(s => s.name);
            const isCorrect = userSymptoms.every(name => correctNames.includes(name)) && 
                              userSymptoms.length === correctNames.length;
            
            if (isCorrect) {
                gameFeedback.innerHTML = `<p style="color:green;">Правильные симптомы обнаружены!</p>`;
            } else {
                gameFeedback.innerHTML = `<p style="color:red;">Неверный набор симптомов. Попробуйте еще раз.</p>`;
            }

            repeatResearchBtn.style.display = 'block';
        });
    }

    // Случайно выбирает 3 симптома из одной подгруппы для "правильного" ответа
    function getCorrectSymptoms() {
        if (allSymptoms.length === 0) {
            return [];
        }
        
        const subgroups = [...new Set(allSymptoms.map(s => s.subgroup))];
        if (subgroups.length === 0) {
            return [];
        }

        const randomSubgroup = subgroups[Math.floor(Math.random() * subgroups.length)];
        const symptomsInSubgroup = allSymptoms.filter(s => s.subgroup === randomSubgroup);
        
        if (symptomsInSubgroup.length < 3) {
            return symptomsInSubgroup;
        }

        const shuffled = symptomsInSubgroup.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    // Генерирует список симптомов для одного исследования
    function generateSymptomsForResearch() {
        if (allSymptoms.length === 0) {
            return [];
        }

        const researchSymptoms = [...correctSymptoms];
        while (researchSymptoms.length < 3) {
            const randomIndex = Math.floor(Math.random() * allSymptoms.length);
            const randomSymptom = allSymptoms[randomIndex];
            
            // Избегаем дубликатов в одном исследовании
            const isSymptomAlreadyInResearch = researchSymptoms.some(s => s.name === randomSymptom.name);
            if (!isSymptomAlreadyInResearch) {
                researchSymptoms.push(randomSymptom);
            }
        }
        
        researchSymptoms.sort(() => 0.5 - Math.random()); // Перемешиваем
        return researchSymptoms;
    }
    
    function displayResearchResult(count, symptoms) {
        const resultCard = document.createElement('div');
        resultCard.classList.add('research-card');
        resultCard.innerHTML = `
            <h4>Исследование #${count}</h4>
            <ul>${symptoms.map(s => `<li>${s.name}</li>`).join('')}</ul>
        `;
        researchResultsContainer.appendChild(resultCard);
    }
});