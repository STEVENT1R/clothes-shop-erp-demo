// ============================
// وحدة تحليل الأرباح
// ============================

const ProfitModule = {
    render() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-chart-line"></i> تحليل الأرباح</h1>
                    <p>الإيرادات والتكاليف وتفصيل الأرباح</p>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fas fa-dollar-sign"></i></div>
                    <div class="stat-info">
                        <h3>${DataStore.getTotalSales()} ج.م</h3>
                        <p>إجمالي الإيرادات</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange"><i class="fas fa-coins"></i></div>
                    <div class="stat-info">
                        <h3>${DataStore.sales.reduce((sum, s) => sum + (s.totalCost || 0), 0)} ج.م</h3>
                        <p>إجمالي التكاليف</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-info">
                        <h3>${DataStore.getTotalProfit()} ج.م</h3>
                        <p>صافي الربح</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple"><i class="fas fa-percentage"></i></div>
                    <div class="stat-info">
                        <h3>${this.getProfitMargin()}%</h3>
                        <p>هامش الربح</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>الربح لكل منتج</h3>
                </div>
                <div class="card-body">
                    <div class="profit-breakdown" id="profitBreakdown"></div>
                </div>
            </div>

            <div class="card" style="margin-top:20px">
                <div class="card-header">
                    <h3>المبيعات الأخيرة</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>المنتجات</th>
                                    <th>الإيرادات</th>
                                    <th>التكلفة</th>
                                    <th>الربح</th>
                                    <th>الهامش</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderSalesRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.renderProductProfit();
    },

    getProfitMargin() {
        const totalSales = DataStore.getTotalSales();
        const totalCost = DataStore.sales.reduce((sum, s) => sum + (s.totalCost || 0), 0);
        if (totalSales === 0) return 0;
        return ((totalSales - totalCost) / totalSales * 100).toFixed(1);
    },

    renderProductProfit() {
        const container = document.getElementById('profitBreakdown');
        const productProfits = {};

        DataStore.sales.forEach(sale => {
            (sale.items || []).forEach(item => {
                const product = DataStore.products.find(p => p.id === item.productId);
                const name = product ? product.name : 'غير معروف';
                if (!productProfits[name]) {
                    productProfits[name] = { revenue: 0, cost: 0, qty: 0 };
                }
                productProfits[name].revenue += (item.sellingPrice || 0) * (item.quantity || 0);
                productProfits[name].cost += (item.costPrice || 0) * (item.quantity || 0);
                productProfits[name].qty += (item.quantity || 0);
            });
        });

        const entries = Object.entries(productProfits);
        if (entries.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>لا توجد بيانات مبيعات بعد</h3></div>`;
            return;
        }

        container.innerHTML = entries.map(([name, data]) => {
            const profit = data.revenue - data.cost;
            const margin = data.revenue > 0 ? ((profit / data.revenue) * 100).toFixed(1) : 0;
            return `
                <div class="profit-item">
                    <div>
                        <div class="product-name">${name}</div>
                        <div style="font-size:12px;color:var(--gray-500)">${data.qty} وحدة مباعة</div>
                    </div>
                    <div style="text-align:left">
                        <div class="profit-value ${profit >= 0 ? 'positive' : 'negative'}">${profit >= 0 ? '+' : ''}${profit} ج.م</div>
                        <div style="font-size:12px;color:var(--gray-500)">هامش ${margin}%</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderSalesRows() {
        if (DataStore.sales.length === 0) {
            return `<tr><td colspan="6" class="empty-state"><i class="fas fa-receipt"></i><h3>لا توجد مبيعات مسجلة</h3></td></tr>`;
        }

        return [...DataStore.sales].reverse().slice(0, 10).map(s => {
            const totalItems = (s.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
            const margin = s.total > 0 ? ((s.profit / s.total) * 100).toFixed(1) : 0;
            return `
                <tr>
                    <td>${new Date(s.date).toLocaleDateString('ar-EG')}</td>
                    <td>${totalItems} منتجات</td>
                    <td>${s.total} ج.م</td>
                    <td>${s.totalCost || 0} ج.م</td>
                    <td style="color:${s.profit >= 0 ? 'var(--success)' : 'var(--danger)'};font-weight:600">${s.profit >= 0 ? '+' : ''}${s.profit} ج.م</td>
                    <td><span class="badge badge-success">${margin}%</span></td>
                </tr>
            `;
        }).join('');
    }
};
