document.addEventListener('DOMContentLoaded', () => {
    const credits = localStorage.getItem('credits');
    const role = localStorage.getItem('role');
    const creditsElement = document.getElementById('credits');
    const backButton = document.getElementById('back-to-main');
    const showSymptomsGameBtn = document.getElementById('show-symptoms-game-btn');
    const symptomsGameCard = document.getElementById('symptoms-game-card');

    let allSymptoms = [];
    let correctSymptoms = [];
    
    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    if (showSymptomsGameBtn) {
        showSymptomsGameBtn.addEventListener('click', () => {
            symptomsGameCard.style.display = 'block';
            initializeGameLogic();
        });
    }

    async function fetchAllSymptoms() {
        try {
            const response = await fetch('/api/symptoms/list');
            allSymptoms = await response.json();
        } catch (error) {
            console.error('Ошибка при загрузке симптомов:', error);
        }
    }
    
    // Вся игровая логика вынесена в отдельную функцию
    async function initializeGameLogic() {
        await fetchAllSymptoms();

        const startResearchBtn = document.getElementById('start-research-btn');
        const researchResultsContainer = document.getElementById('research-results-container');
        const userInputSection = document.getElementById('user-input-section');
        const symptomInputFields = document.querySelectorAll('.symptom-input');
        const checkSymptomsBtn = document.getElementById('check-symptoms-btn');
        const gameFeedback = document.getElementById('game-feedback');
        const repeatResearchBtn = document.getElementById('repeat-research-btn');
        
        const correctAnswerDisplay = document.createElement('div');
        correctAnswerDisplay.id = 'correct-answer-display';
        correctAnswerDisplay.style.display = 'none';
        correctAnswerDisplay.style.marginTop = '20px';
        correctAnswerDisplay.style.borderTop = '1px solid #dee2e6';
        correctAnswerDisplay.style.paddingTop = '20px';
        if (userInputSection) {
             userInputSection.parentNode.insertBefore(correctAnswerDisplay, userInputSection.nextSibling);
        }

        if (role === 'superadmin') {
            correctAnswerDisplay.style.display = 'block';
        }

        correctSymptoms = getCorrectSymptoms();
        
        if (startResearchBtn) {
            startResearchBtn.addEventListener('click', () => {
                startResearchBtn.disabled = true;
                researchResultsContainer.innerHTML = '';
                gameFeedback.innerHTML = '';
                userInputSection.style.display = 'none';
                repeatResearchBtn.style.display = 'none';
                symptomInputFields.forEach(input => input.value = '');

                if (role === 'superadmin') {
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
            if (allSymptoms.length < 2) {
                return allSymptoms;
            }
            
            const subgroups = [...new Set(allSymptoms.map(s => s.subgroup))];
            let correctSymptoms = [];
            let attempts = 0;
            const maxAttempts = 10;

            while (correctSymptoms.length < 2 && attempts < maxAttempts) {
                const randomSubgroup = subgroups[Math.floor(Math.random() * subgroups.length)];
                const symptomsInSubgroup = allSymptoms.filter(s => s.subgroup === randomSubgroup);

                if (symptomsInSubgroup.length >= 2) {
                    const count = (symptomsInSubgroup.length >= 3 && Math.random() < 0.5) ? 3 : 2;
                    const shuffled = symptomsInSubgroup.sort(() => 0.5 - Math.random());
                    correctSymptoms = shuffled.slice(0, count);
                }
                attempts++;
            }

            if (correctSymptoms.length < 2) {
                const shuffledAll = allSymptoms.sort(() => 0.5 - Math.random());
                return shuffledAll.slice(0, 2);
            }

            return correctSymptoms;
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
            if (researchResultsContainer) {
                researchResultsContainer.appendChild(resultCard);
            }
        }

        function displayCorrectAnswer() {
            if (correctAnswerDisplay) {
                correctAnswerDisplay.innerHTML = `
                    <h4>Правильные симптомы (только для Superadmin):</h4>
                    <ul>${correctSymptoms.map(s => `<li>${s.name}</li>`).join('')}</ul>
                `;
            }
        }
    }
});