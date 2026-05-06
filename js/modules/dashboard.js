// ============================
// وحدة لوحة التحكم
// ============================

const DashboardModule = {
    render() {
        const content = document.getElementById('mainContent');
        const todaySales = DataStore.getTodaysSales();
        const totalRevenue = DataStore.getTotalSales();
        const totalProfit = DataStore.getTotalProfit();
        const totalStock = DataStore.getTotalStockItems();
        const totalDebt = DataStore.getTotalSupplierDebt();
        const lowStockItems = DataStore.getLowStockItems();
        const outOfStockItems = DataStore.getOutOfStockItems();

        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-chart-pie"></i> لوحة التحكم</h1>
                    <p>نظرة عامة على عمليات متجر الملابس</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-outline" onclick="DashboardModule.render()">
                        <i class="fas fa-sync"></i> تحديث
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
                    <div class="stat-info">
                        <h3>${todaySales} ج.م</h3>
                        <p>مبيعات اليوم</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-dollar-sign"></i></div>
                    <div class="stat-info">
                        <h3>${totalRevenue} ج.م</h3>
                        <p>إجمالي الإيرادات</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-info">
                        <h3>${totalProfit} ج.م</h3>
                        <p>إجمالي الربح</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange"><i class="fas fa-boxes"></i></div>
                    <div class="stat-info">
                        <h3>${totalStock}</h3>
                        <p>إجمالي المخزون</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fas fa-handshake"></i></div>
                    <div class="stat-info">
                        <h3>${totalDebt} ج.م</h3>
                        <p>إجمالي ديون الموردين</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon teal"><i class="fas fa-tag"></i></div>
                    <div class="stat-info">
                        <h3>${DataStore.products.length}</h3>
                        <p>إجمالي المنتجات</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-section">
                    <h2><i class="fas fa-exclamation-triangle" style="color:var(--warning)"></i> تنبيهات المخزون المنخفض</h2>
                    <div class="alert-list" id="lowStockAlerts">
                        ${this.renderLowStockAlerts(lowStockItems, outOfStockItems)}
                    </div>
                </div>

                <div class="dashboard-section">
                    <h2><i class="fas fa-clock"></i> آخر النشاطات</h2>
                    <div class="alert-list" id="recentActivity">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>
        `;
    },

    renderLowStockAlerts(lowStockItems, outOfStockItems) {
        let html = '';

        if (outOfStockItems.length > 0) {
            outOfStockItems.forEach(item => {
                const product = DataStore.products.find(p => p.id === item.productId);
                html += `
                    <div class="alert-item">
                        <div class="alert-icon danger"><i class="fas fa-times-circle"></i></div>
                        <div class="alert-info">
                            <h4>نفذ من المخزون: ${product ? product.name : 'غير معروف'}</h4>
                            <p>${item.color} / ${item.size} - لا يوجد مخزون متاح</p>
                        </div>
                        <a class="alert-action" onclick="app.navigate('inventory')">عرض المخزون</a>
                    </div>
                `;
            });
        }

        lowStockItems.forEach(item => {
            const product = DataStore.products.find(p => p.id === item.productId);
            html += `
                <div class="alert-item">
                    <div class="alert-icon warning"><i class="fas fa-exclamation"></i></div>
                    <div class="alert-info">
                        <h4>مخزون منخفض: ${product ? product.name : 'غير معروف'}</h4>
                        <p>${item.color} / ${item.size} - متبقي ${item.stock} فقط</p>
                    </div>
                    <a class="alert-action" onclick="app.navigate('inventory')">عرض المخزون</a>
                </div>
            `;
        });

        if (!html) {
            html = `<div class="empty-state" style="padding:24px">
                <i class="fas fa-check-circle" style="color:var(--success)"></i>
                <h3>جميع المنتجات متوفرة</h3>
                <p>لا توجد تنبيهات في الوقت الحالي</p>
            </div>`;
        }

        return html;
    },

    renderRecentActivity() {
        const recentLogs = DataStore.logs.slice(0, 5);

        if (recentLogs.length === 0) {
            return `<div class="empty-state" style="padding:24px">
                <i class="fas fa-history"></i>
                <h3>لا توجد نشاطات حديثة</h3>
            </div>`;
        }

        const logIcons = {
            sale: { icon: 'fa-shopping-cart', bg: '#dcfce7', color: '#16a34a' },
            purchase: { icon: 'fa-truck-loading', bg: '#dbeafe', color: '#2563eb' },
            payment: { icon: 'fa-credit-card', bg: '#fef3c7', color: '#d97706' },
            product: { icon: 'fa-box', bg: '#ede9fe', color: '#7c3aed' },
            supplier: { icon: 'fa-handshake', bg: '#ccfbf1', color: '#0d9488' },
            system: { icon: 'fa-cog', bg: '#f1f5f9', color: '#64748b' }
        };

        return recentLogs.map(l => {
            const iconData = logIcons[l.type] || logIcons.system;
            const date = new Date(l.date);
            const timeStr = date.toLocaleDateString('ar-EG') + ' ' + date.toLocaleTimeString('ar-EG');
            return `
                <div class="alert-item">
                    <div class="alert-icon" style="background:${iconData.bg};color:${iconData.color}">
                        <i class="fas ${iconData.icon}"></i>
                    </div>
                    <div class="alert-info">
                        <h4>${l.action}</h4>
                        <p>${l.details} - ${timeStr}</p>
                    </div>
                    <a class="alert-action" onclick="app.navigate('logs')">عرض السجلات</a>
                </div>
            `;
        }).join('');
    }
};
