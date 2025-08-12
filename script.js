function showPage(pageId) {
    // Скрываем все страницы
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(page => page.classList.remove('active'));

    // Показываем нужную страницу
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
}