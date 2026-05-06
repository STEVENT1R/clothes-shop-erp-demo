// ============================
// وحدة التحكم الرئيسية للتطبيق
// ============================

const app = {
    currentPage: null,

    init() {
        DataStore.init();
        Theme.init();
        this.setupModal();
    },

    login() {
        const userType = document.getElementById('loginUser').value;
        Auth.login(userType);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';

        document.getElementById('userName').textContent = Auth.currentUser.name;

        this.navigate('dashboard');
    },

    logout() {
        Auth.logout();
        this.currentPage = null;
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    },

    navigate(page) {
        if (!Auth.currentUser) return;

        const restricted = ['products', 'inventory', 'purchases', 'suppliers', 'logs', 'profit', 'settings', 'dashboard'];
        if (!Auth.isAdmin() && restricted.includes(page)) {
            app.showToast('ليس لديك صلاحية الوصول إلى هذه الصفحة', 'error');
            return;
        }

        this.currentPage = page;

        // رصد وضع العرض المستقل (PWA) وإخفاء شريط تثبيت التطبيق
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            const banner = document.getElementById('pwaBanner');
            if (banner) banner.style.display = 'none';
        }

        // Close sidebar on mobile/tablet after navigation
        if (window.innerWidth <= 1024) {
            this.closeSidebar();
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        switch (page) {
            case 'dashboard':
                DashboardModule.render();
                break;
            case 'products':
                ProductsModule.render();
                break;
            case 'sales':
                SalesModule.render();
                break;
            case 'inventory':
                InventoryModule.render();
                break;
            case 'purchases':
                PurchasesModule.render();
                break;
            case 'suppliers':
                SuppliersModule.render();
                break;
            case 'logs':
                LogsModule.render();
                break;
            case 'profit':
                ProfitModule.render();
                break;
            case 'settings':
                this.renderSettings();
                break;
            default:
                DashboardModule.render();
        }
    },

    renderSettings() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-cog"></i> الإعدادات</h1>
                    <p>إعدادات النظام وإدارة البيانات</p>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-moon"></i> الوضع الليلي / النهاري</h3>
                <p>${Theme.current === 'dark' ? 'الوضع الليلي نشط' : 'الوضع النهاري نشط'}</p>
                <button class="btn btn-warning" onclick="Theme.toggle(); app.renderSettings();">
                    <i class="fas ${Theme.current === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
                    ${Theme.current === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                </button>
            </div>
            <div class="settings-card" style="margin-top:16px">
                <h3><i class="fas fa-database"></i> بيانات التجربة</h3>
                <p>إعادة تعيين جميع بيانات النظام إلى حالة التجربة الافتراضية</p>
                <div style="display:flex;gap:10px">
                    <button class="btn btn-danger" onclick="app.resetDemoData()">
                        <i class="fas fa-trash"></i> إعادة تعيين البيانات
                    </button>
                </div>
            </div>
            <div class="settings-card" style="margin-top:16px">
                <h3><i class="fas fa-user-shield"></i> الحساب</h3>
                <p>أنت مسجل الدخول باسم <strong>${Auth.getUserName()}</strong> مع ${Auth.isAdmin() ? 'صلاحية كاملة (مدير)' : 'صلاحية مبيعات فقط (كاشير)'}.</p>
                <button class="btn btn-outline" onclick="app.logout()">
                    <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                </button>
            </div>
            <div class="settings-card" style="margin-top:16px">
                <h3><i class="fas fa-info-circle"></i> حول النظام</h3>
                <p><strong>نظام إدارة الملابس</strong> - الإصدار 1.0</p>
                <p style="font-size:13px;color:var(--gray-400)">نظام ERP خفيف لمتاجر الملابس - مبني بلغة JavaScript نقية</p>
            </div>
        `;
    },

    resetDemoData() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
            if (confirm('تأكيد إعادة التعيين! سيتم فقدان جميع البيانات الحالية.')) {
                DataStore.reset();
                app.showToast('تم إعادة تعيين البيانات بنجاح', 'success');
                DataStore.addLog({ type: 'system', action: 'إعادة تعيين بيانات التجربة', details: 'تم إعادة تعيين جميع بيانات النظام إلى الحالة الافتراضية', userId: Auth.getUserId() });
                if (this.currentPage === 'settings' || this.currentPage === 'dashboard') {
                    this.navigate('dashboard');
                } else {
                    this.navigate(this.currentPage);
                }
            }
        }
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        let overlay = document.querySelector('.sidebar-overlay');

        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('mobile-open');
            sidebar.classList.remove('collapsed');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.addEventListener('click', () => this.closeSidebar());
                document.body.appendChild(overlay);
            }
            overlay.classList.toggle('active', sidebar.classList.contains('mobile-open'));
        } else {
            sidebar.classList.toggle('collapsed');
        }
    },

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
    },

    showModal(title, bodyHtml, footerHtml = null, noFooter = false) {
        const modal = document.getElementById('modalOverlay');
        const footerContent = footerHtml || `<button class="btn btn-outline" onclick="app.closeModal()">إغلاق</button>`;

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">${bodyHtml}</div>
                ${noFooter ? '' : `<div class="modal-footer">${footerContent}</div>`}
            </div>
        `;
        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    },

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast ' + type + ' show';
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    setupModal() {
        if (!document.getElementById('modalOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'modalOverlay';
            overlay.className = 'modal-overlay';
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModal();
            });
            document.body.appendChild(overlay);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
