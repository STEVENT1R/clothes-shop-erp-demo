// ============================
// وحدة السجلات - تتبع نشاط النظام
// ============================

const LogsModule = {
    render() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-history"></i> سجل النشاطات</h1>
                    <p>تتبع جميع نشاطات النظام: المبيعات، المشتريات، المدفوعات والمزيد</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-outline" onclick="LogsModule.clearLogs()">
                        <i class="fas fa-trash"></i> مسح السجلات
                    </button>
                </div>
            </div>
            <div class="filters-bar">
                <div class="form-group">
                    <label>تصفية حسب النوع</label>
                    <select class="form-control form-control-sm" id="logTypeFilter" onchange="LogsModule.renderLogs()">
                        <option value="">جميع السجلات</option>
                        <option value="sale">المبيعات</option>
                        <option value="purchase">المشتريات</option>
                        <option value="payment">المدفوعات</option>
                        <option value="product">المنتجات</option>
                        <option value="supplier">الموردين</option>
                        <option value="system">النظام</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>تصفية حسب المستخدم</label>
                    <select class="form-control form-control-sm" id="logUserFilter" onchange="LogsModule.renderLogs()">
                        <option value="">جميع المستخدمين</option>
                        <option value="admin">مدير</option>
                        <option value="cashier">كاشير</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>&nbsp;</label>
                    <button class="btn btn-sm btn-outline" onclick="LogsModule.renderLogs()">
                        <i class="fas fa-sync"></i> تحديث
                    </button>
                </div>
            </div>
            <div id="logsContainer"></div>
        `;

        this.renderLogs();
    },

    renderLogs() {
        const container = document.getElementById('logsContainer');
        const typeFilter = document.getElementById('logTypeFilter')?.value || '';
        const userFilter = document.getElementById('logUserFilter')?.value || '';

        let logs = [...DataStore.logs];
        if (typeFilter) logs = logs.filter(l => l.type === typeFilter);
        if (userFilter) logs = logs.filter(l => l.userId === userFilter);

        if (logs.length === 0) {
            container.innerHTML = `<div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>لا توجد سجلات</h3>
                <p>ستظهر نشاطات النظام هنا</p>
            </div>`;
            return;
        }

        const logIcons = {
            sale: { icon: 'fa-shopping-cart', color: '#16a34a', bg: '#dcfce7' },
            purchase: { icon: 'fa-truck-loading', color: '#2563eb', bg: '#dbeafe' },
            payment: { icon: 'fa-credit-card', color: '#d97706', bg: '#fef3c7' },
            product: { icon: 'fa-box', color: '#7c3aed', bg: '#ede9fe' },
            supplier: { icon: 'fa-handshake', color: '#0d9488', bg: '#ccfbf1' },
            system: { icon: 'fa-cog', color: '#64748b', bg: '#f1f5f9' }
        };

        const logColors = {
            sale: { bg: '#dcfce7', color: '#16a34a', text: 'بيع' },
            purchase: { bg: '#dbeafe', color: '#2563eb', text: 'شراء' },
            payment: { bg: '#fef3c7', color: '#d97706', text: 'دفعة' },
            product: { bg: '#ede9fe', color: '#7c3aed', text: 'منتج' },
            supplier: { bg: '#ccfbf1', color: '#0d9488', text: 'مورد' },
            system: { bg: '#f1f5f9', color: '#64748b', text: 'نظام' }
        };

        container.innerHTML = logs.map(l => {
            const iconData = logIcons[l.type] || logIcons.system;
            const colorData = logColors[l.type] || logColors.system;
            const date = new Date(l.date);
            const timeStr = date.toLocaleDateString('ar-EG') + ' ' + date.toLocaleTimeString('ar-EG');
            return `
                <div class="log-item">
                    <div class="log-icon" style="background:${iconData.bg};color:${iconData.color}">
                        <i class="fas ${iconData.icon}"></i>
                    </div>
                    <div class="log-content">
                        <div class="log-action">${l.action}</div>
                        <div class="log-details">${l.details}</div>
                        <div class="log-time">
                            <span class="log-badge" style="background:${colorData.bg};color:${colorData.color}">${colorData.text}</span>
                            ${timeStr} - بواسطة ${l.userId === 'admin' ? 'مدير' : 'كاشير'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    clearLogs() {
        if (confirm('هل تريد مسح جميع سجلات النشاطات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            DataStore.logs = [];
            DataStore.save();
            this.renderLogs();
            app.showToast('تم مسح السجلات', 'info');
        }
    }
};
