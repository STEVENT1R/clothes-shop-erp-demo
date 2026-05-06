// ============================
// الوضع الليلي
// ============================

const Theme = {
    current: 'light',

    init() {
        const saved = localStorage.getItem('clothesErpTheme');
        if (saved === 'dark') {
            this.current = 'dark';
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        this.updateButton();
    },

    toggle() {
        if (this.current === 'dark') {
            this.current = 'light';
            document.documentElement.removeAttribute('data-theme');
        } else {
            this.current = 'dark';
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        localStorage.setItem('clothesErpTheme', this.current);
        this.updateButton();
    },

    updateButton() {
        const btn = document.getElementById('darkModeToggle');
        if (!btn) return;
        if (this.current === 'dark') {
            btn.innerHTML = '<i class="fas fa-sun"></i>';
            btn.title = 'الوضع النهاري';
        } else {
            btn.innerHTML = '<i class="fas fa-moon"></i>';
            btn.title = 'الوضع الليلي';
        }
    }
};
