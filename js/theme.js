// js/theme.js
(function() {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = isDark ? 'light_mode' : 'dark_mode';
            }
        });
        
        const icon = themeToggle.querySelector('.material-symbols-outlined');
        if (icon) {
            const isDark = html.classList.contains('dark');
            icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        }
    }
})();