// ============================
// وحدة المخزون
// ============================

const InventoryModule = {
    render() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-warehouse"></i> المخزون</h1>
                    <p>عرض وإدارة المخزون حسب متغيرات المنتج</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="filters-bar">
                        <div class="form-group">
                            <label>المنتج</label>
                            <select class="form-control form-control-sm" id="invProductFilter" onchange="InventoryModule.applyFilters()">
                                <option value="">جميع المنتجات</option>
                                ${DataStore.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>اللون</label>
                            <select class="form-control form-control-sm" id="invColorFilter" onchange="InventoryModule.applyFilters()">
                                <option value="">جميع الألوان</option>
                                ${[...new Set(DataStore.inventory.map(i => i.color))].map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>المقاس</label>
                            <select class="form-control form-control-sm" id="invSizeFilter" onchange="InventoryModule.applyFilters()">
                                <option value="">جميع المقاسات</option>
                                ${[...new Set(DataStore.inventory.map(i => i.size))].sort((a,b) => a-b).map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>الحالة</label>
                            <select class="form-control form-control-sm" id="invStatusFilter" onchange="InventoryModule.applyFilters()">
                                <option value="">الكل</option>
                                <option value="low">مخزون منخفض (&le;5)</option>
                                <option value="out">نفذ من المخزون</option>
                                <option value="in">متوفر</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>اللون</th>
                                    <th>المقاس</th>
                                    <th>المخزون</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody id="invTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.applyFilters();
    },

    applyFilters() {
        const productId = document.getElementById('invProductFilter')?.value || '';
        const color = document.getElementById('invColorFilter')?.value || '';
        const size = document.getElementById('invSizeFilter')?.value || '';
        const status = document.getElementById('invStatusFilter')?.value || '';

        let items = [...DataStore.inventory];

        if (productId) items = items.filter(i => i.productId === parseInt(productId));
        if (color) items = items.filter(i => i.color === color);
        if (size) items = items.filter(i => i.size === size);
        if (status === 'low') items = items.filter(i => i.stock > 0 && i.stock <= 5);
        if (status === 'out') items = items.filter(i => i.stock === 0);
        if (status === 'in') items = items.filter(i => i.stock > 5);

        const tbody = document.getElementById('invTableBody');
        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fas fa-search"></i> لا توجد عناصر مخزون تطابق الفلاتر</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => {
            const product = DataStore.products.find(p => p.id === item.productId);
            const stockClass = item.stock === 0 ? 'badge-danger' : (item.stock <= 5 ? 'badge-warning' : 'badge-success');
            const stockLabel = item.stock === 0 ? 'نفذ من المخزون' : (item.stock <= 5 ? 'مخزون منخفض' : 'متوفر');
            return `
                <tr>
                    <td><strong>${product ? product.name : 'غير معروف'}</strong></td>
                    <td><span class="badge badge-info">${item.color}</span></td>
                    <td>${item.size}</td>
                    <td class="${item.stock <= 5 ? 'low-stock' : ''}"><strong>${item.stock}</strong></td>
                    <td><span class="badge ${stockClass}">${stockLabel}</span></td>
                </tr>
            `;
        }).join('');
    }
};
