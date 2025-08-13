document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/version');
        const data = await response.json();
        
        const versionElement = document.getElementById('app-version');
        if (versionElement) {
            versionElement.textContent = `Version alpha ${data.version}`;
        }
    } catch (error) {
        console.error('Ошибка при получении версии:', error);
    }
});