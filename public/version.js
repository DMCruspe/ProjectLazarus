document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/version');
        const data = await response.json();
        
        // ИЗМЕНЕНО: используем querySelectorAll для выбора всех элементов с классом
        const versionElements = document.querySelectorAll('.app-version');
        
        // Проходим по каждому элементу и обновляем его
        versionElements.forEach(element => {
            element.textContent = `Version alpha ${data.version}`;
        });
    } catch (error) {
        console.error('Ошибка при получении версии:', error);
    }
});