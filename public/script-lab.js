document.addEventListener('DOMContentLoaded', () => {
    const credits = localStorage.getItem('credits');
    const role = localStorage.getItem('role'); // Получаем роль пользователя
    const creditsElement = document.getElementById('credits');
    const backButton = document.getElementById('back-to-main');
    
    // Элементы игры
    const startResearchBtn = document.getElementById('start-research-btn');
    const researchResultsContainer = document.getElementById('research-results-container');
    const userInputSection = document.getElementById('user-input-section');
    const symptomInputFields = document.querySelectorAll('.symptom-input');
    const checkSymptomsBtn = document.getElementById('check-symptoms-btn');
    const gameFeedback = document.getElementById('game-feedback');
    const repeatResearchBtn = document.getElementById('repeat-research-btn');
    
    // Элемент для отображения правильного ответа
    const correctAnswerDisplay = document.createElement('div');
    correctAnswerDisplay.id = 'correct-answer-display';
    correctAnswerDisplay.style.display = 'none';
    correctAnswerDisplay.style.marginTop = '20px';
    correctAnswerDisplay.style.borderTop = '1px solid #dee2e6';
    correctAnswerDisplay.style.paddingTop = '20px';
    
    let allSymptoms = [];
    let correctSymptoms = [];
    
    async function fetchAllSymptoms() {
        try {
            const response = await fetch('/api/symptoms/list');
            allSymptoms = await response.json();
            correctSymptoms = getCorrectSymptoms();
            
            // Если пользователь - superadmin, показываем правильный ответ
            if (role === 'superadmin') {
                displayCorrectAnswer();
            }
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

    // Добавляем элемент для отображения правильного ответа в DOM
    userInputSection.parentNode.insertBefore(correctAnswerDisplay, userInputSection.nextSibling);

    if (startResearchBtn) {
        startResearchBtn.addEventListener('click', () => {
            startResearchBtn.disabled = true;
            researchResultsContainer.innerHTML = '';
            gameFeedback.innerHTML = '';
            userInputSection.style.display = 'none';
            repeatResearchBtn.style.display = 'none';
            symptomInputFields.forEach(input => input.value = '');

            // Обновляем отображение правильного ответа, если это superadmin
            if (role === 'superadmin') {
                correctAnswerDisplay.style.display = 'block';
                displayCorrectAnswer();
            }
            
            let researchCount = 0;
            const interval = setInterval(() => {
                researchCount++;
                const newSymptoms = generateSymptomsForResearch();
                displayResearchResult(researchCount, newSymptoms);
                
                if (researchCount >= 3) {
                    clearInterval(interval);
                    userInputSection.style.display = 'block';
                }
            }, 5000);
        });
    }

    if (repeatResearchBtn) {
        repeatResearchBtn.addEventListener('click', () => {
            startResearchBtn.disabled = false;
            repeatResearchBtn.style.display = 'none';
            researchResultsContainer.innerHTML = '';
            userInputSection.style.display = 'none';
            gameFeedback.innerHTML = '';
            symptomInputFields.forEach(input => input.value = '');
            correctSymptoms = getCorrectSymptoms();
            
            if (role === 'superadmin') {
                displayCorrectAnswer();
            } else {
                correctAnswerDisplay.style.display = 'none';
            }
        });
    }
    
    if (checkSymptomsBtn) {
        checkSymptomsBtn.addEventListener('click', () => {
            const userSymptoms = Array.from(symptomInputFields)
                                    .map(input => input.value.trim())
                                    .filter(value => value);
            
            if (userSymptoms.length < 2 || userSymptoms.length > 3) {
                gameFeedback.innerHTML = `<p style="color:red;">Пожалуйста, введите от 2 до 3 симптомов.</p>`;
                return;
            }

            const correctNames = correctSymptoms.map(s => s.name);

            const isCorrect = userSymptoms.length === correctNames.length && 
                              userSymptoms.every(name => correctNames.includes(name));
            
            if (isCorrect) {
                gameFeedback.innerHTML = `<p style="color:green;">Правильные симптомы обнаружены!</p>`;
            } else {
                gameFeedback.innerHTML = `<p style="color:red;">Неверный набор симптомов. Попробуйте еще раз.</p>`;
            }

            repeatResearchBtn.style.display = 'block';
        });
    }

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
        
        const count = Math.random() < 0.5 && symptomsInSubgroup.length >= 2 ? 2 : 3;
        const shuffled = symptomsInSubgroup.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    function generateSymptomsForResearch() {
        if (allSymptoms.length === 0) {
            return [];
        }

        const researchSymptoms = [...correctSymptoms];
        while (researchSymptoms.length < 3) {
            const randomIndex = Math.floor(Math.random() * allSymptoms.length);
            const randomSymptom = allSymptoms[randomIndex];
            
            const isSymptomAlreadyInResearch = researchSymptoms.some(s => s.name === randomSymptom.name);
            if (!isSymptomAlreadyInResearch) {
                researchSymptoms.push(randomSymptom);
            }
        }
        
        researchSymptoms.sort(() => 0.5 - Math.random());
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

    function displayCorrectAnswer() {
        correctAnswerDisplay.innerHTML = `
            <h4>Правильные симптомы (только для Superadmin):</h4>
            <ul>${correctSymptoms.map(s => `<li>${s.name}</li>`).join('')}</ul>
        `;
    }
});