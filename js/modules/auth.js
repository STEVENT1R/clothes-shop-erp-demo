// ============================
// وحدة المصادقة
// ============================

const Auth = {
    currentUser: null,

    login(userType) {
        this.currentUser = {
            type: userType,
            name: userType === 'admin' ? 'مدير' : 'كاشير',
            isAdmin: userType === 'admin'
        };
        this.updateUI();
    },

    logout() {
        this.currentUser = null;
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    },

    updateUI() {
        document.getElementById('userName').textContent = this.currentUser.name;

        const restrictedPages = ['products', 'inventory', 'purchases', 'suppliers', 'logs', 'profit', 'settings', 'dashboard'];
        if (!this.currentUser.isAdmin) {
            document.querySelectorAll('.nav-item').forEach(item => {
                const page = item.dataset.page;
                if (restrictedPages.includes(page)) {
                    item.style.display = 'none';
                }
            });
            app.navigate('sales');
        } else {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.style.display = 'flex';
            });
            app.navigate('dashboard');
        }
    },

    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    },

    getUserName() {
        return this.currentUser ? this.currentUser.name : 'زائر';
    },

    getUserId() {
        return this.currentUser ? this.currentUser.type : 'guest';
    }
};
