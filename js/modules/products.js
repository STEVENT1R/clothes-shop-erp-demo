// ============================
// وحدة المنتجات
// ============================

const ProductsModule = {
    render() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-box"></i> المنتجات</h1>
                    <p>إدارة منتجات الملابس والمتغيرات</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="ProductsModule.showAddModal()">
                        <i class="fas fa-plus"></i> إضافة منتج
                    </button>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الفئة</th>
                                    <th>سعر التكلفة</th>
                                    <th>سعر البيع</th>
                                    <th>الهامش</th>
                                    <th>المتغيرات</th>
                                    <th>المخزون الكلي</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderProductRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderProductRows() {
        return DataStore.products.map(p => {
            const variants = DataStore.getProductVariants(p.id);
            const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
            const margin = p.sellingPrice - p.costPrice;
            const marginPercent = ((margin / p.costPrice) * 100).toFixed(0);
            return `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td><span class="badge badge-info">${p.category}</span></td>
                    <td>${p.costPrice} ج.م</td>
                    <td>${p.sellingPrice} ج.م</td>
                    <td><span class="badge badge-success">${margin} ج.م (${marginPercent}%)</span></td>
                    <td>${variants.length}</td>
                    <td>${totalStock}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="ProductsModule.showVariants(${p.id})">
                            <i class="fas fa-eye"></i> المتغيرات
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    showVariants(productId) {
        const product = DataStore.products.find(p => p.id === productId);
        const variants = DataStore.getProductVariants(productId);
        const html = variants.map(v => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)">
                <span>${v.color} / ${v.size}</span>
                <span><strong>${v.stock}</strong></span>
            </div>
        `).join('') || '<p class="empty-state" style="padding:16px">لا توجد متغيرات</p>';

        app.showModal(
            `${product.name} - المتغيرات`,
            `<div style="max-height:400px;overflow-y:auto">${html}</div>`
        );
    },

    showAddModal() {
        const modal = document.getElementById('modalOverlay');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>إضافة منتج</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>اسم المنتج</label>
                        <input type="text" class="form-control" id="newProductName" placeholder="مثال: قميص عادي">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>الفئة</label>
                            <select class="form-control" id="newProductCategory">
                                <option value="تيشيرتات">تيشيرتات</option>
                                <option value="جينز">جينز</option>
                                <option value="هوديات">هوديات</option>
                                <option value="جاكيتات">جاكيتات</option>
                                <option value="شورتات">شورتات</option>
                                <option value="إكسسوارات">إكسسوارات</option>
                                <option value="أخرى">أخرى</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>سعر التكلفة (ج.م)</label>
                            <input type="number" class="form-control" id="newProductCost" min="0" step="1">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>سعر البيع (ج.م)</label>
                            <input type="number" class="form-control" id="newProductPrice" min="0" step="1">
                        </div>
                        <div class="form-group">
                            <label>&nbsp;</label>
                            <div style="padding-top:4px">
                                <button class="btn btn-success btn-block" onclick="ProductsModule.addProduct()">
                                    <i class="fas fa-save"></i> حفظ المنتج
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },

    addProduct() {
        const name = document.getElementById('newProductName').value.trim();
        const category = document.getElementById('newProductCategory').value;
        const cost = parseInt(document.getElementById('newProductCost').value) || 0;
        const price = parseInt(document.getElementById('newProductPrice').value) || 0;

        if (!name) { app.showToast('الرجاء إدخال اسم المنتج', 'error'); return; }
        if (cost <= 0 || price <= 0) { app.showToast('الرجاء إدخال أسعار صحيحة', 'error'); return; }
        if (price <= cost) { app.showToast('سعر البيع يجب أن يكون أعلى من التكلفة', 'error'); return; }

        const maxId = DataStore.products.length > 0 ? Math.max(...DataStore.products.map(p => p.id)) : 0;
        DataStore.products.push({ id: maxId + 1, name, category, costPrice: cost, sellingPrice: price });
        DataStore.save();

        app.closeModal();
        app.showToast(`تم إنشاء المنتج "${name}" بنجاح!`, 'success');
        DataStore.addLog({ type: 'product', action: 'تم إنشاء منتج', details: `${name} - ${price} ج.م`, userId: Auth.getUserId() });

        if (app.currentPage === 'products') this.render();
    }
};
