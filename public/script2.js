document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const credits = localStorage.getItem('credits');
    
    const welcomeMessageElement = document.getElementById('welcome-message');
    const creditsElement = document.getElementById('credits');
    const addCreditsButton = document.getElementById('add-credits-btn');

    if (username) {
        welcomeMessageElement.textContent = `Добро пожаловать, ${username}!`;
        if (creditsElement) {
            creditsElement.textContent = `${credits} R`;
        }
    } else {
        window.location.href = 'index.html';
    }
    
      // ДОБАВЛЕНО: Обработчик для кнопки "Лаборатория"
    const labButton = document.getElementById('lab-button');
    if (labButton) {
        labButton.addEventListener('click', () => {
            window.location.href = 'lab.html';
        });
    }


    // Показываем кнопки для администраторов
    const playersButton = document.getElementById('players-button');
    const constructorButton = document.getElementById('constructor-button');

    if (role === 'admin' || role === 'superadmin') {
        if (playersButton) {
            playersButton.style.display = 'block';
        }
        if (constructorButton) {
            constructorButton.style.display = 'block';
        }
    }
    
    // ДОБАВЛЕНО: Показываем кнопку "+" только для superadmin
    if (role === 'superadmin' && addCreditsButton) {
        addCreditsButton.style.display = 'block';
        
        // Обработчик события для кнопки "+"
        addCreditsButton.addEventListener('click', async () => {
            const amountToAdd = 100; // Пример: добавляем 100 кредитов
            
            try {
                const response = await fetch('/api/add-credits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: username, amount: amountToAdd })
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert(result.message);
                    // Обновляем баланс в localStorage и на странице
                    const newCredits = parseInt(localStorage.getItem('credits')) + amountToAdd;
                    localStorage.setItem('credits', newCredits);
                    creditsElement.textContent = `${newCredits} R`;
                } else {
                    alert('Ошибка: ' + result.message);
                }
            } catch (error) {
                console.error('Ошибка при добавлении кредитов:', error);
                alert('Произошла ошибка при добавлении кредитов.');
            }
        });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            localStorage.removeItem('credits');
            
            window.location.href = 'index.html';
        });
    }
});