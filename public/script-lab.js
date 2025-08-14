document.addEventListener('DOMContentLoaded', () => {
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const backButton = document.getElementById('back-to-main');
    
    // Элементы игры
    const startResearchBtn = document.getElementById('start-research-btn');
    const timerDisplay = document.getElementById('timer-display');
    const symptomsResult = document.getElementById('symptoms-result');
    const userInputSection = document.getElementById('user-input-section');
    const symptomSelection = document.getElementById('symptom-selection');
    const checkSymptomsBtn = document.getElementById('check-symptoms-btn');
    const gameFeedback = document.getElementById('game-feedback');
    const repeatResearchBtn = document.getElementById('repeat-research-btn');
    
    let allSymptoms = [];
    let correctSymptoms = [];
    let selectedSymptoms = [];

    // Загрузка всех симптомов из базы данных при запуске
    async function fetchAllSymptoms() {
        try {
            const response = await fetch('/api/symptoms/list');
            allSymptoms = await response.json();
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
            symptomsResult.innerHTML = '';
            gameFeedback.innerHTML = '';
            userInputSection.style.display = 'none';
            repeatResearchBtn.style.display = 'none';

            let timeLeft = 5;
            timerDisplay.textContent = `Таймер: ${timeLeft} сек`;
            
            correctSymptoms = getCorrectSymptoms();
            
            const timer = setInterval(() => {
                timeLeft--;
                timerDisplay.textContent = `Таймер: ${timeLeft} сек`;
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    timerDisplay.textContent = `Исследование завершено!`;
                    showSymptoms();
                }
            }, 1000);
        });
    }
    
    if (repeatResearchBtn) {
        repeatResearchBtn.addEventListener('click', () => {
            startResearchBtn.disabled = false;
            repeatResearchBtn.style.display = 'none';
            symptomsResult.innerHTML = '';
            userInputSection.style.display = 'none';
            gameFeedback.innerHTML = '';
        });
    }

    function getCorrectSymptoms() {
        if (allSymptoms.length === 0) {
            return [];
        }
        
        const subgroups = [...new Set(allSymptoms.map(s => s.subgroup))];
        const randomSubgroup = subgroups[Math.floor(Math.random() * subgroups.length)];
        const symptomsInSubgroup = allSymptoms.filter(s => s.subgroup === randomSubgroup);
        
        if (symptomsInSubgroup.length < 3) {
            return symptomsInSubgroup;
        }

        const shuffled = symptomsInSubgroup.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }
    
    function showSymptoms() {
        const allPossibleSymptoms = [...allSymptoms];
        const symptomsToShow = [...correctSymptoms];
        
        while (symptomsToShow.length < 3) {
            const randomIndex = Math.floor(Math.random() * allPossibleSymptoms.length);
            const randomSymptom = allPossibleSymptoms[randomIndex];
            
            // Проверяем, чтобы симптом не был уже в списке
            const isSymptomAlreadyShown = symptomsToShow.some(s => s.name === randomSymptom.name);
            const isSymptomCorrect = correctSymptoms.some(s => s.name === randomSymptom.name);
            
            if (!isSymptomAlreadyShown && !isSymptomCorrect) {
                symptomsToShow.push(randomSymptom);
            }
        }
        
        symptomsToShow.sort(() => 0.5 - Math.random());
        
        symptomsResult.innerHTML = `<h4>Найденные симптомы:</h4><ul>${symptomsToShow.map(s => `<li>${s.name}</li>`).join('')}</ul>`;
        
        userInputSection.style.display = 'block';
        symptomSelection.innerHTML = symptomsToShow.map(s => `<button class="symptom-btn" data-symptom-name="${s.name}">${s.name}</button>`).join('');

        selectedSymptoms = [];
        const symptomButtons = symptomSelection.querySelectorAll('.symptom-btn');
        symptomButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('selected')) {
                    button.classList.remove('selected');
                    selectedSymptoms = selectedSymptoms.filter(name => name !== button.dataset.symptomName);
                } else {
                    if (selectedSymptoms.length < 3) {
                        button.classList.add('selected');
                        selectedSymptoms.push(button.dataset.symptomName);
                    }
                }
            });
        });
    }

    if (checkSymptomsBtn) {
        checkSymptomsBtn.addEventListener('click', () => {
            if (selectedSymptoms.length === 0) {
                gameFeedback.innerHTML = `<p style="color:red;">Пожалуйста, выберите хотя бы один симптом.</p>`;
                return;
            }
            
            const correctNames = correctSymptoms.map(s => s.name);
            const isCorrect = selectedSymptoms.every(name => correctNames.includes(name)) && 
                              selectedSymptoms.length === correctNames.length;
            
            if (isCorrect) {
                gameFeedback.innerHTML = `<p style="color:green;">Правильные симптомы обнаружены!</p>`;
            } else {
                gameFeedback.innerHTML = `<p style="color:red;">Неверный набор симптомов. Попробуйте еще раз.</p>`;
            }

            repeatResearchBtn.style.display = 'block';
        });
    }
});