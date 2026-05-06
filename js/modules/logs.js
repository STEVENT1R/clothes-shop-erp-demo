// ============================
// وحدة سجل النشاطات - مع تجميع يومي
// ============================

const LogsModule = {
    render() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-history"></i> سجل النشاطات</h1>
                    <p>تتبع جميع نشاطات النظام مرتبة حسب اليوم - مبيعات، مشتريات، مدفوعات والمزيد</p>
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

        let logs = [...DataStore.logs];
        if (typeFilter) logs = logs.filter(l => l.type === typeFilter);

        if (logs.length === 0) {
            container.innerHTML = `<div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>لا توجد سجلات</h3>
                <p>ستظهر نشاطات النظام هنا</p>
            </div>`;
            return;
        }

        // Group logs by day
        const groups = {};
        logs.forEach(l => {
            const date = new Date(l.date);
            const dayKey = date.toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!groups[dayKey]) {
                groups[dayKey] = { logs: [], dateObj: date };
            }
            groups[dayKey].logs.push(l);
        });

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

        // Sort day keys descending (newest first)
        const sortedDays = Object.keys(groups).sort((a, b) => {
            return groups[b].dateObj - groups[a].dateObj;
        });

        // Check if today or yesterday
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let html = '';
        sortedDays.forEach(dayKey => {
            const dayData = groups[dayKey];
            const dayStart = new Date(dayData.dateObj);
            dayStart.setHours(0, 0, 0, 0);

            let dayLabel = dayKey;
            if (dayStart.getTime() === today.getTime()) {
                dayLabel = '📅 اليوم';
            } else if (dayStart.getTime() === yesterday.getTime()) {
                dayLabel = '📅 أمس';
            }

            // Calculate day totals
            const daySales = dayData.logs.filter(l => l.type === 'sale').length;
            const dayPurchases = dayData.logs.filter(l => l.type === 'purchase').length;
            const dayPayments = dayData.logs.filter(l => l.type === 'payment').length;

            html += `
                <div class="day-group" style="margin-bottom:20px">
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:linear-gradient(135deg,var(--primary-light),#e0e7ff);border-radius:var(--radius-sm) var(--radius-sm) 0 0;margin-bottom:8px">
                        <div>
                            <h3 style="font-size:15px;font-weight:700;color:var(--primary-dark);margin:0">
                                ${dayLabel}
                            </h3>
                            <p style="font-size:12px;color:var(--gray-500);margin:2px 0 0">${dayKey}</p>
                        </div>
                        <div style="display:flex;gap:10px;font-size:12px">
                            <span style="color:var(--success);font-weight:600"><i class="fas fa-shopping-cart"></i> ${daySales} مبيعات</span>
                            <span style="color:var(--info);font-weight:600"><i class="fas fa-truck-loading"></i> ${dayPurchases} مشتريات</span>
                            <span style="color:var(--warning);font-weight:600"><i class="fas fa-credit-card"></i> ${dayPayments} دفعات</span>
                            <span style="color:var(--gray-500);font-weight:600"><i class="fas fa-list"></i> ${dayData.logs.length} نشاط</span>
                        </div>
                    </div>
                    <div style="padding:0;display:flex;flex-direction:column;gap:6px">
                        ${dayData.logs.map(l => {
                            const iconData = logIcons[l.type] || logIcons.system;
                            const colorData = logColors[l.type] || logColors.system;
                            const date = new Date(l.date);
                            const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                            return `
                                <div class="log-item" style="margin-bottom:0">
                                    <div class="log-icon" style="background:${iconData.bg};color:${iconData.color}">
                                        <i class="fas ${iconData.icon}"></i>
                                    </div>
                                    <div class="log-content">
                                        <div class="log-action">${l.action}</div>
                                        <div class="log-details">${l.details}</div>
                                        <div class="log-time">
                                            <span class="log-badge" style="background:${colorData.bg};color:${colorData.color}">${colorData.text}</span>
                                            ⏰ ${timeStr} - بواسطة ${l.userId === 'admin' ? 'مدير' : 'كاشير'}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    clearLogs() {
        if (confirm('هل أنت متأكد من مسح جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            DataStore.logs = [];
            DataStore.save();
            this.renderLogs();
            app.showToast('تم مسح السجلات', 'info');
        }
    }
};
