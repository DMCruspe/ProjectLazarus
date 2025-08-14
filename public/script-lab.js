document.addEventListener('DOMContentLoaded', () => {
    const credits = localStorage.getItem('credits');
    const role = localStorage.getItem('role');
    const creditsElement = document.getElementById('credits');
    const backButton = document.getElementById('back-to-main');
    
    // Кнопки для запуска игр
    const showSymptomsGameBtn = document.getElementById('show-symptoms-game-btn');
    const showSpreadGameBtn = document.getElementById('show-spread-game-btn');
    const showVulnerabilityGameBtn = document.getElementById('show-vulnerability-game-btn');
    const showVaccineGameBtn = document.getElementById('show-vaccine-game-btn');
    const showIdentifyTypeGameBtn = document.getElementById('show-identify-type-game-btn'); // Новая кнопка

    // Контейнеры игр
    const symptomsGameCard = document.getElementById('symptoms-game-card');
    const spreadGameCard = document.getElementById('spread-game-card');
    const vulnerabilityGameCard = document.getElementById('vulnerability-game-card');
    const vaccineGameCard = document.getElementById('vaccine-game-card');
    const identifyTypeGameCard = document.getElementById('identify-type-game-card'); // Новый контейнер

    let allSymptoms = [];
    let correctSymptoms = [];
    let correctSpreadPath = '';
    let correctVulnerabilities = {};

    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    function hideAllGameCards() {
        symptomsGameCard.style.display = 'none';
        spreadGameCard.style.display = 'none';
        vulnerabilityGameCard.style.display = 'none';
        vaccineGameCard.style.display = 'none';
        identifyTypeGameCard.style.display = 'none';
    }

    // Обработчики для кнопок навигации
    if (showSymptomsGameBtn) {
        showSymptomsGameBtn.addEventListener('click', () => {
            hideAllGameCards();
            symptomsGameCard.style.display = 'block';
            initializeSymptomsGameLogic();
        });
    }

    if (showSpreadGameBtn) {
        showSpreadGameBtn.addEventListener('click', () => {
            hideAllGameCards();
            spreadGameCard.style.display = 'block';
            initializeSpreadGameLogic();
        });
    }
    
    if (showVulnerabilityGameBtn) {
        showVulnerabilityGameBtn.addEventListener('click', () => {
            hideAllGameCards();
            vulnerabilityGameCard.style.display = 'block';
            initializeVulnerabilityGameLogic();
        });
    }

    if (showVaccineGameBtn) {
        showVaccineGameBtn.addEventListener('click', () => {
            hideAllGameCards();
            vaccineGameCard.style.display = 'block';
            initializeVaccineGameLogic();
        });
    }

    if (showIdentifyTypeGameBtn) {
        showIdentifyTypeGameBtn.addEventListener('click', () => {
            hideAllGameCards();
            identifyTypeGameCard.style.display = 'block';
            loadMinigameIdentifyType();
        });
    }
    
    // === ЛОГИКА НОВОЙ ИГРЫ (ОПРЕДЕЛИТЬ ТИП) ===
    const gameContentIdentifyType = document.getElementById('game-content-identify-type');
    const nextIdentifyTypeGameBtn = document.getElementById('next-identify-type-game-btn');

    async function loadMinigameIdentifyType() {
        gameContentIdentifyType.innerHTML = `<p>Загрузка...</p>`;
        nextIdentifyTypeGameBtn.style.display = 'none';
        await fetchGameData();
    }

    async function fetchGameData() {
        try {
            const response = await fetch('/api/minigame/identify-type');
            const data = await response.json();

            if (!response.ok) {
                gameContentIdentifyType.innerHTML = `<p>${data.message}</p>`;
                return;
            }

            const { imageUrl, answers, correctAnswer } = data;

            gameContentIdentifyType.innerHTML = `
                <div class="game-card-content">
                    <img src="${imageUrl}" alt="Изображение болезни">
                    <div class="answer-buttons">
                        ${answers.map(answer => `<button class="nav-button" onclick="checkAnswer('${answer}', '${correctAnswer}')">${answer}</button>`).join('')}
                    </div>
                    <div id="game-feedback-identify-type" class="game-feedback"></div>
                </div>
            `;
            
            // Назначаем обработчик для кнопки "Следующая игра" после загрузки
            nextIdentifyTypeGameBtn.onclick = fetchGameData;
            nextIdentifyTypeGameBtn.textContent = 'Следующая игра';

        } catch (error) {
            console.error('Ошибка при загрузке игры:', error);
            gameContentIdentifyType.innerHTML = `<p>Произошла ошибка при загрузке игры.</p>`;
        }
    }

    window.checkAnswer = function(selectedAnswer, correctAnswer) {
        const feedback = document.getElementById('game-feedback-identify-type');
        if (selectedAnswer === correctAnswer) {
            feedback.textContent = 'Верно! 🎉';
            feedback.style.color = 'green';
        } else {
            feedback.textContent = `Неверно. Правильный ответ: ${correctAnswer}.`;
            feedback.style.color = 'red';
        }
        // Отключаем кнопки, чтобы нельзя было ответить еще раз
        document.querySelectorAll('#game-content-identify-type .answer-buttons button').forEach(button => {
            button.disabled = true;
        });
        nextIdentifyTypeGameBtn.style.display = 'block';
    }

    // === ЛОГИКА ПЕРВОЙ ИГРЫ (СИМПТОМЫ) ===
    async function fetchAllSymptoms() {
        try {
            const response = await fetch('/api/symptoms/list');
            allSymptoms = await response.json();
        } catch (error) {
            console.error('Ошибка при загрузке симптомов:', error);
        }
    }

    async function initializeSymptomsGameLogic() {
        await fetchAllSymptoms();
        const startResearchBtn = document.getElementById('start-research-btn');
        const researchResultsContainer = document.getElementById('research-results-container');
        const userInputSection = document.getElementById('user-input-section');
        const symptomInputFields = document.querySelectorAll('.symptom-input');
        const checkSymptomsBtn = document.getElementById('check-symptoms-btn');
        const gameFeedback = document.getElementById('game-feedback-symptoms');
        const repeatResearchBtn = document.getElementById('repeat-research-btn');
        
        const correctAnswerDisplay = document.createElement('div');
        correctAnswerDisplay.id = 'correct-answer-display-symptoms';
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
                    displayCorrectAnswerSymptoms();
                }
                
                let researchCount = 0;
                const interval = setInterval(() => {
                    researchCount++;
                    const newSymptoms = generateSymptomsForResearch();
                    displayResearchResultSymptoms(researchCount, newSymptoms);
                    
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
                    displayCorrectAnswerSymptoms();
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
        
        function displayResearchResultSymptoms(count, symptoms) {
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

        function displayCorrectAnswerSymptoms() {
            if (correctAnswerDisplay) {
                correctAnswerDisplay.innerHTML = `
                    <h4>Правильные симптомы (только для Superadmin):</h4>
                    <ul>${correctSymptoms.map(s => `<li>${s.name}</li>`).join('')}</ul>
                `;
            }
        }
    }

    // === ЛОГИКА ВТОРОЙ ИГРЫ (РАСПРОСТРАНЕНИЕ) ===
    async function initializeSpreadGameLogic() {
        const spreadPaths = ['воздушно-капельный', 'контактный', 'через-воду', 'через-пищу'];
        correctSpreadPath = spreadPaths[Math.floor(Math.random() * spreadPaths.length)];

        const startSpreadResearchBtn = document.getElementById('start-spread-research-btn');
        const spreadPathSelect = document.getElementById('spread-path-select');
        const spreadResearchResultsContainer = document.getElementById('spread-research-results-container');
        const spreadPathConfirmation = document.getElementById('spread-path-confirmation');
        const confirmSpreadPathBtn = document.getElementById('confirm-spread-path-btn');
        const gameFeedbackSpread = document.getElementById('game-feedback-spread');
        const repeatSpreadResearchBtn = document.getElementById('repeat-spread-research-btn');
        
        const correctAnswerDisplay = document.createElement('div');
        correctAnswerDisplay.id = 'correct-answer-display-spread';
        correctAnswerDisplay.style.display = 'none';
        correctAnswerDisplay.style.marginTop = '20px';
        correctAnswerDisplay.style.borderTop = '1px solid #dee2e6';
        correctAnswerDisplay.style.paddingTop = '20px';
        if (spreadPathConfirmation) {
            spreadPathConfirmation.parentNode.insertBefore(correctAnswerDisplay, spreadPathConfirmation.nextSibling);
        }

        if (role === 'superadmin') {
            correctAnswerDisplay.style.display = 'block';
            displayCorrectAnswerSpread();
        }

        if (startSpreadResearchBtn) {
            startSpreadResearchBtn.addEventListener('click', () => {
                const selectedPath = spreadPathSelect.value;
                const isCorrectPath = selectedPath === correctSpreadPath;

                let percentages = [];
                for (let i = 0; i < 3; i++) {
                    percentages.push(generatePercentage(isCorrectPath));
                }

                displaySpreadResults(selectedPath, percentages);
                spreadPathConfirmation.style.display = 'block';
            });
        }
        
        if (confirmSpreadPathBtn) {
            confirmSpreadPathBtn.addEventListener('click', () => {
                const selectedPath = spreadPathSelect.value;
                if (selectedPath === correctSpreadPath) {
                    gameFeedbackSpread.innerHTML = `<p style="color:green;">Верно! Вы нашли основной путь распространения: ${selectedPath}.</p>`;
                } else {
                    gameFeedbackSpread.innerHTML = `<p style="color:red;">К сожалению, это не основной путь распространения. Попробуйте еще раз.</p>`;
                }
                repeatSpreadResearchBtn.style.display = 'block';
            });
        }
        
        if (repeatSpreadResearchBtn) {
            repeatSpreadResearchBtn.addEventListener('click', () => {
                gameFeedbackSpread.innerHTML = '';
                spreadResearchResultsContainer.innerHTML = '';
                spreadPathConfirmation.style.display = 'none';
                repeatSpreadResearchBtn.style.display = 'none';
                correctSpreadPath = spreadPaths[Math.floor(Math.random() * spreadPaths.length)];
                if (role === 'superadmin') {
                    displayCorrectAnswerSpread();
                } else {
                    correctAnswerDisplay.style.display = 'none';
                }
            });
        }
        
        function generatePercentage(isCorrect) {
            if (isCorrect) {
                return Math.floor(Math.random() * (99 - 70 + 1)) + 70;
            } else {
                return Math.floor(Math.random() * (30 - 10 + 1)) + 10;
            }
        }

        function displaySpreadResults(path, percentages) {
            spreadResearchResultsContainer.innerHTML = `
                <h4>Результаты исследования "${path}":</h4>
                <ul>
                    <li>Результат 1: ${percentages[0]}%</li>
                    <li>Результат 2: ${percentages[1]}%</li>
                    <li>Результат 3: ${percentages[2]}%</li>
                </ul>
            `;
        }

        function displayCorrectAnswerSpread() {
             if (correctAnswerDisplay) {
                correctAnswerDisplay.innerHTML = `
                    <h4>Правильный путь (только для Superadmin):</h4>
                    <p>${correctSpreadPath}</p>
                `;
            }
        }
    }

    // === ЛОГИКА ТРЕТЬЕЙ ИГРЫ (УЯЗВИМОСТИ) ===
    async function initializeVulnerabilityGameLogic() {
        const factors = ['влажность', 'свет', 'радиация', 'температура'];
        const vulnerabilityFactorSelect = document.getElementById('vulnerability-factor-select');
        const startVulnerabilityResearchBtn = document.getElementById('start-vulnerability-research-btn');
        const vulnerabilityResearchResultsContainer = document.getElementById('vulnerability-research-results-container');
        const vulnerabilityUserInputSection = document.getElementById('vulnerability-user-input-section');
        const vulnerableFactorsInput = document.getElementById('vulnerable-factors');
        const resistantFactorsInput = document.getElementById('resistant-factors');
        const checkVulnerabilityBtn = document.getElementById('check-vulnerability-btn');
        const gameFeedback = document.getElementById('game-feedback-vulnerability');
        const repeatVulnerabilityResearchBtn = document.getElementById('repeat-vulnerability-research-btn');
        const concentrationInput = document.getElementById('concentration-input');
        const factorPercentageInput = document.getElementById('factor-percentage');
        
        const correctAnswerDisplay = document.createElement('div');
        correctAnswerDisplay.id = 'correct-answer-display-vulnerability';
        correctAnswerDisplay.style.display = 'none';
        correctAnswerDisplay.style.marginTop = '20px';
        correctAnswerDisplay.style.borderTop = '1px solid #dee2e6';
        correctAnswerDisplay.style.paddingTop = '20px';
        if (vulnerabilityUserInputSection) {
            vulnerabilityUserInputSection.parentNode.insertBefore(correctAnswerDisplay, vulnerabilityUserInputSection.nextSibling);
        }

        let thresholds = {};

        function generateCorrectVulnerabilities() {
            const vulnerableCount = Math.floor(Math.random() * 2) + 1;
            const shuffledFactors = factors.sort(() => 0.5 - Math.random());
            
            correctVulnerabilities = {
                vulnerable: shuffledFactors.slice(0, vulnerableCount),
                resistant: shuffledFactors.slice(vulnerableCount)
            };
            
            correctVulnerabilities.vulnerable.forEach(factor => {
                thresholds[factor] = Math.floor(Math.random() * (70 - 40 + 1)) + 40;
            });
        }
        
        generateCorrectVulnerabilities();
        if (role === 'superadmin') {
            correctAnswerDisplay.style.display = 'block';
            displayCorrectAnswerVulnerability();
        }

        vulnerabilityFactorSelect.addEventListener('change', () => {
            concentrationInput.style.display = 'block';
        });

        if (startVulnerabilityResearchBtn) {
            startVulnerabilityResearchBtn.addEventListener('click', () => {
                const selectedFactor = vulnerabilityFactorSelect.value;
                const factorPercentage = parseInt(factorPercentageInput.value);
                
                const isVulnerable = correctVulnerabilities.vulnerable.includes(selectedFactor);
                
                let resultPercentage;
                if (isVulnerable) {
                    if (factorPercentage >= thresholds[selectedFactor]) {
                        resultPercentage = 0;
                    } else {
                        resultPercentage = 100 - (factorPercentage / thresholds[selectedFactor]) * 100;
                        if (resultPercentage < 10) resultPercentage = 10;
                    }
                    resultPercentage = Math.round(resultPercentage);
                } else {
                    resultPercentage = Math.floor(Math.random() * (100 - 90 + 1)) + 90;
                }

                vulnerabilityResearchResultsContainer.innerHTML = `
                    <h4>Результат для "${selectedFactor}" при ${factorPercentage}%:</h4>
                    <p>Процент выживших бактерий: <strong>${resultPercentage}%</strong></p>
                `;
                vulnerabilityUserInputSection.style.display = 'block';
            });
        }
        
        if (checkVulnerabilityBtn) {
            checkVulnerabilityBtn.addEventListener('click', () => {
                const userVulnerable = vulnerableFactorsInput.value.split(',').map(f => f.trim()).filter(f => f);
                const userResistant = resistantFactorsInput.value.split(',').map(f => f.trim()).filter(f => f);

                const isVulnerableCorrect = userVulnerable.length === correctVulnerabilities.vulnerable.length &&
                                             userVulnerable.every(f => correctVulnerabilities.vulnerable.includes(f));

                const isResistantCorrect = userResistant.length === correctVulnerabilities.resistant.length &&
                                             userResistant.every(f => correctVulnerabilities.resistant.includes(f));
                
                if (isVulnerableCorrect && isResistantCorrect) {
                    gameFeedback.innerHTML = `<p style="color:green;">Верно! Вы правильно определили уязвимые и устойчивые факторы.</p>`;
                } else {
                    gameFeedback.innerHTML = `<p style="color:red;">Неверно. Попробуйте еще раз.</p>`;
                }
                
                repeatVulnerabilityResearchBtn.style.display = 'block';
            });
        }

        if (repeatVulnerabilityResearchBtn) {
            repeatVulnerabilityResearchBtn.addEventListener('click', () => {
                vulnerabilityResearchResultsContainer.innerHTML = '';
                vulnerabilityUserInputSection.style.display = 'none';
                gameFeedback.innerHTML = '';
                repeatVulnerabilityResearchBtn.style.display = 'none';
                vulnerableFactorsInput.value = '';
                resistantFactorsInput.value = '';
                concentrationInput.style.display = 'none';
                generateCorrectVulnerabilities();
                 if (role === 'superadmin') {
                    displayCorrectAnswerVulnerability();
                } else {
                    correctAnswerDisplay.style.display = 'none';
                }
            });
        }
        
        function displayCorrectAnswerVulnerability() {
            if (correctAnswerDisplay) {
                let thresholdsInfo = correctVulnerabilities.vulnerable.map(f => `${f}: >${thresholds[f]}% - погибает`).join('<br>');
                correctAnswerDisplay.innerHTML = `
                    <h4>Правильные факторы (только для Superadmin):</h4>
                    <p><strong>Уязвимые:</strong> ${correctVulnerabilities.vulnerable.join(', ')}</p>
                    <p><strong>Устойчивые:</strong> ${correctVulnerabilities.resistant.join(', ')}</p>
                    <p><strong>Пороги (для уязвимых):</strong><br>${thresholdsInfo}</p>
                `;
            }
        }
    }

    // === ЛОГИКА ЧЕТВЁРТОЙ ИГРЫ (ВАКЦИНА) ===
    let availableCompounds = [];
    let selectedCompounds = [];
    let idealCombination = [];

    const compoundsData = [
        { name: 'Амрицилин', sideEffects: 10, dose: 20 },
        { name: 'Вакцинал', sideEffects: 15, dose: 15 },
        { name: 'Дезвирион', sideEffects: 20, dose: 25 },
        { name: 'Митокс', sideEffects: 5, dose: 30 },
        { name: 'Ревертокс', sideEffects: 8, dose: 18 },
        { name: 'Синтостатин', sideEffects: 12, dose: 22 },
        { name: 'Фенирион', sideEffects: 25, dose: 10 },
        { name: 'Эстромицин', sideEffects: 18, dose: 28 },
    ];

    function initializeVaccineGameLogic() {
        const compoundListContainer = document.getElementById('compound-list-container');
        const selectedCompound1 = document.getElementById('selected-compound-1');
        const selectedCompound2 = document.getElementById('selected-compound-2');
        const combineCompoundsBtn = document.getElementById('combine-compounds-btn');
        const vaccineResearchResultsContainer = document.getElementById('vaccine-research-results-container');
        const gameFeedbackVaccine = document.getElementById('game-feedback-vaccine');
        const repeatVaccineResearchBtn = document.getElementById('repeat-vaccine-research-btn');
        
        const correctAnswerDisplay = document.createElement('div');
        correctAnswerDisplay.id = 'correct-answer-display-vaccine';
        correctAnswerDisplay.style.display = 'none';
        correctAnswerDisplay.style.marginTop = '20px';
        correctAnswerDisplay.style.borderTop = '1px solid #dee2e6';
        correctAnswerDisplay.style.paddingTop = '20px';
        if (gameFeedbackVaccine) {
            gameFeedbackVaccine.parentNode.insertBefore(correctAnswerDisplay, gameFeedbackVaccine.nextSibling);
        }

        function startGame() {
            availableCompounds = [...compoundsData].sort(() => 0.5 - Math.random()).slice(0, 5);
            selectedCompounds = [];
            compoundListContainer.innerHTML = '';
            vaccineResearchResultsContainer.innerHTML = '';
            gameFeedbackVaccine.innerHTML = '';
            repeatVaccineResearchBtn.style.display = 'none';
            selectedCompound1.textContent = 'Препарат 1';
            selectedCompound2.textContent = 'Препарат 2';
            combineCompoundsBtn.disabled = true;

            const ideal1Index = Math.floor(Math.random() * availableCompounds.length);
            let ideal2Index = Math.floor(Math.random() * availableCompounds.length);
            while (ideal2Index === ideal1Index) {
                ideal2Index = Math.floor(Math.random() * availableCompounds.length);
            }
            
            idealCombination = [availableCompounds[ideal1Index].name, availableCompounds[ideal2Index].name];

            availableCompounds.forEach(compound => {
                const compoundCard = document.createElement('div');
                compoundCard.classList.add('compound-card');
                compoundCard.innerHTML = `
                    <p><strong>${compound.name}</strong></p>
                    <p>Побочные эффекты: ${compound.sideEffects}</p>
                    <p>Доза: ${compound.dose}</p>
                `;
                compoundCard.addEventListener('click', () => selectCompound(compound, compoundCard));
                compoundListContainer.appendChild(compoundCard);
            });
            
            if (role === 'superadmin') {
                displayCorrectAnswerVaccine();
            } else {
                 correctAnswerDisplay.style.display = 'none';
            }
        }

        function selectCompound(compound, card) {
            if (selectedCompounds.length < 2 && !selectedCompounds.includes(compound)) {
                selectedCompounds.push(compound);
                card.classList.add('selected');

                if (selectedCompounds.length === 1) {
                    selectedCompound1.textContent = compound.name;
                } else if (selectedCompounds.length === 2) {
                    selectedCompound2.textContent = compound.name;
                    combineCompoundsBtn.disabled = false;
                }
            } else if (selectedCompounds.includes(compound)) {
                selectedCompounds = selectedCompounds.filter(c => c !== compound);
                card.classList.remove('selected');
                
                if (selectedCompounds.length === 1) {
                    selectedCompound1.textContent = selectedCompounds[0].name;
                    selectedCompound2.textContent = 'Препарат 2';
                } else if (selectedCompounds.length === 0) {
                    selectedCompound1.textContent = 'Препарат 1';
                    selectedCompound2.textContent = 'Препарат 2';
                }
                combineCompoundsBtn.disabled = true;
            }
        }
        
        if (combineCompoundsBtn) {
            combineCompoundsBtn.addEventListener('click', () => {
                if (selectedCompounds.length !== 2) {
                    gameFeedbackVaccine.innerHTML = `<p style="color:red;">Выберите ровно два препарата!</p>`;
                    return;
                }

                const compound1 = selectedCompounds[0];
                const compound2 = selectedCompounds[1];

                const combinedDose = (compound1.dose + compound2.dose) / 2;
                const combinedSideEffects = compound1.sideEffects + compound2.sideEffects;

                vaccineResearchResultsContainer.innerHTML = `
                    <h4>Результаты нового соединения:</h4>
                    <p><strong>Средняя доза:</strong> ${combinedDose.toFixed(1)}</p>
                    <p><strong>Суммарные побочные эффекты:</strong> ${combinedSideEffects}</p>
                `;

                // Условия победы
                const victoryDose = 25; // Пример: доза, необходимая для уничтожения вируса
                const maxSideEffect = 30; // Пример: максимальный допустимый побочный эффект

                if (combinedDose >= victoryDose && combinedSideEffects <= maxSideEffect) {
                    gameFeedbackVaccine.innerHTML = `<p style="color:green;">Поздравляем! Вы создали эффективную вакцину, которая уничтожит вирус без сильных побочных эффектов.</p>`;
                } else if (combinedDose >= victoryDose && combinedSideEffects > maxSideEffect) {
                    gameFeedbackVaccine.innerHTML = `<p style="color:orange;">Вакцина эффективна, но имеет слишком сильные побочные эффекты. Попробуйте найти другую комбинацию.</p>`;
                } else {
                    gameFeedbackVaccine.innerHTML = `<p style="color:red;">Эта комбинация неэффективна. Доза слишком мала, чтобы уничтожить вирус. Попробуйте еще раз.</p>`;
                }

                repeatVaccineResearchBtn.style.display = 'block';
            });
        }
        
        if (repeatVaccineResearchBtn) {
            repeatVaccineResearchBtn.addEventListener('click', startGame);
        }

        function displayCorrectAnswerVaccine() {
            if (correctAnswerDisplay) {
                correctAnswerDisplay.innerHTML = `
                    <h4>Правильная комбинация (только для Superadmin):</h4>
                    <p>${idealCombination.join(' + ')}</p>
                `;
            }
        }
        
        startGame();
    }
});