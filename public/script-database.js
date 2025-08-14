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
                    diseaseCard.classList.add('task-card'); // Используем те же стили

                    let deleteButtonHtml = '';
                    if (role === 'admin' || role === 'superadmin') {
                        deleteButtonHtml = `<button class="delete-btn" data-id="${disease._id}">Удалить</button>`;
                    }

                    diseaseCard.innerHTML = `
                        <h3>${disease.name} (${disease.type})</h3>
                        <p><strong>Симптомы:</strong> ${disease.symptoms}</p>
                        <p><strong>Распространение:</strong> ${disease.spread}</p>
                        <p><strong>Устойчивость:</strong> ${disease.resistance}</p>
                        <p><strong>Уязвимости:</strong> ${disease.vulnerabilities}</p>
                        <p><strong>Лечение:</strong> ${disease.treatment}</p>
                        <p><strong>Вакцина:</strong> ${disease.vaccine || 'Нет'}</p>
                        ${deleteButtonHtml}
                    `;
                    diseaseListContainer.appendChild(diseaseCard);
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке болезней:', error);
            diseaseListContainer.innerHTML = '<p>Ошибка при загрузке базы данных.</p>';
        }
    }

    diseaseListContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const diseaseId = e.target.dataset.id;
            if (confirm('Вы уверены, что хотите удалить эту болезнь?')) {
                await deleteDisease(diseaseId);
            }
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
                fetchAndDisplayDiseases(); // Обновляем список
            } else {
                alert('Ошибка: ' + result.message);
            }
        } catch (error) {
            console.error('Ошибка при удалении болезни:', error);
            alert('Произошла ошибка при удалении.');
        }
    }
});