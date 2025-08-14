document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    const creditsElement = document.getElementById('credits');
    const diseaseListContainer = document.getElementById('disease-list-container');
    const backButton = document.getElementById('back-to-main');
    
    if (creditsElement) {
        creditsElement.textContent = `${credits} R`;
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'site2.html';
        });
    }

    fetchAndDisplayDiseases();

    async function fetchAndDisplayDiseases() {
        try {
            const response = await fetch('/api/diseases/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterUsername: username })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    diseaseListContainer.innerHTML = '<p>Доступ запрещён.</p>';
                    return;
                }
                throw new Error('Не удалось загрузить список болезней');
            }

            const diseases = await response.json();
            diseaseListContainer.innerHTML = '';

            if (diseases.length === 0) {
                diseaseListContainer.innerHTML = '<p>База данных болезней пуста.</p>';
            } else {
                diseases.forEach(disease => {
                    const diseaseCard = document.createElement('div');
                    diseaseCard.classList.add('task-card');

                    let deleteButtonHtml = '';
                    if (role === 'admin' || role === 'superadmin') {
                        deleteButtonHtml = `<button class="delete-btn" data-id="${disease._id}">Удалить</button>`;
                    }
                    
                    let vaccineButtonHtml = '';
                    // Check if a vaccine name is associated with the disease
                    if (disease.vaccine) {
                        vaccineButtonHtml = `<button class="show-vaccine-btn" data-vaccine-name="${disease.vaccine}">Показать вакцину</button>`;
                    }

                    // *** CORRECTED LINE HERE ***
                    // We need to add the vaccineButtonHtml to the innerHTML string.
                    diseaseCard.innerHTML = `
                        <h3>${disease.name} (${disease.type})</h3>
                        <p><strong>Симптомы:</strong> ${disease.symptoms}</p>
                        <p><strong>Распространение:</strong> ${disease.spread}</p>
                        <p><strong>Устойчивость:</strong> ${disease.resistance}</p>
                        <p><strong>Уязвимости:</strong> ${disease.vulnerabilities}</p>
                        <p><strong>Лечение:</strong> ${disease.treatment}</p>
                        <p><strong>Вакцина:</strong> ${disease.vaccine || 'Нет'}</p>
                        ${deleteButtonHtml}
                        ${vaccineButtonHtml}
                    `;
                    diseaseListContainer.appendChild(diseaseCard);
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке болезней:', error);
            diseaseListContainer.innerHTML = '<p>Ошибка при загрузке базы данных.</p>';
        }
    }

    // *** CORRECTED BLOCK HERE ***
    // We need to add an event listener for the new button.
    diseaseListContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const diseaseId = e.target.dataset.id;
            if (confirm('Вы уверены, что хотите удалить эту болезнь?')) {
                await deleteDisease(diseaseId);
            }
        }
        
        // Listen for clicks on the 'show-vaccine-btn' button
        if (e.target.classList.contains('show-vaccine-btn')) {
            const vaccineName = e.target.dataset.vaccineName;
            await fetchAndDisplayVaccine(vaccineName);
        }
    });

    async function deleteDisease(diseaseId) {
        try {
            const response = await fetch('/api/disease/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diseaseId: diseaseId, requesterUsername: username })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchAndDisplayDiseases();
            } else {
                alert('Ошибка: ' + result.message);
            }
        } catch (error) {
            console.error('Ошибка при удалении болезни:', error);
            alert('Произошла ошибка при удалении.');
        }
    }

    async function fetchAndDisplayVaccine(vaccineName) {
        try {
            const response = await fetch('/api/vaccine/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: vaccineName })
            });

            if (!response.ok) {
                throw new Error('Вакцина не найдена или ошибка сервера.');
            }

            const vaccine = await response.json();
            
            alert(`Информация о вакцине "${vaccine.name}":\n\n` + 
                  `Болезнь: ${vaccine.diseaseName}\n` +
                  `Дозировка: ${vaccine.dosage}\n` +
                  `Эффективность: ${vaccine.effectiveness}%\n` +
                  `Побочные эффекты: ${vaccine.sideEffects || 'Нет'}`);

        } catch (error) {
            console.error('Ошибка при получении информации о вакцине:', error);
            alert('Произошла ошибка при получении информации о вакцине.');
        }
    }
});