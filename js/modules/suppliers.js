// ============================
// وحدة الموردين - تتبع الديون
// ============================

const SuppliersModule = {
    render() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-handshake"></i> تتبع ديون الموردين</h1>
                    <p>إدارة الموردين وتتبع الديون وتسجيل المدفوعات</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="SuppliersModule.showAddSupplierModal()">
                        <i class="fas fa-plus"></i> إضافة مورد
                    </button>
                </div>
            </div>
            <div id="suppliersGrid" class="grid-4"></div>
        `;

        this.renderSuppliers();
    },

    renderSuppliers() {
        const grid = document.getElementById('suppliersGrid');
        const suppliers = DataStore.getSuppliers();

        if (suppliers.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
                <i class="fas fa-users"></i>
                <h3>لا يوجد موردون بعد</h3>
                <p>أضف مورداً لبدء تتبع المشتريات والديون</p>
            </div>`;
            return;
        }

        grid.innerHTML = suppliers.map(s => {
            const debtClass = (s.remainingDebt || 0) > 0 ? 'positive' : 'zero';
            const purchases = DataStore.purchases.filter(p => p.supplierId === s.id);
            return `
                <div class="supplier-card">
                    <div class="supplier-card-header">
                        <div>
                            <h3><i class="fas fa-building" style="color:var(--primary);margin-left:6px"></i> ${s.name}</h3>
                        </div>
                        <div class="debt-amount ${debtClass}">
                            ${(s.remainingDebt || 0) > 0 ? `${s.remainingDebt} ج.م` : '<span style="font-size:14px;font-weight:500">✓ مدفوع</span>'}
                        </div>
                    </div>
                    <div style="font-size:13px;color:var(--gray-500);margin-bottom:12px">
                        ${(s.remainingDebt || 0) > 0 ? 'ديون مستحقة' : 'لا توجد ديون مستحقة'}
                    </div>
                    <div class="supplier-stats">
                        <div class="supplier-stat">
                            <div class="value">${s.totalPurchases || 0} ج.م</div>
                            <div class="label">إجمالي المشتريات</div>
                        </div>
                        <div class="supplier-stat">
                            <div class="value">${s.totalPaid || 0} ج.م</div>
                            <div class="label">إجمالي المدفوع</div>
                        </div>
                        <div class="supplier-stat">
                            <div class="value" style="color:var(--danger)">${s.remainingDebt || 0} ج.م</div>
                            <div class="label">المتبقي</div>
                        </div>
                        <div class="supplier-stat">
                            <div class="value">${purchases.length}</div>
                            <div class="label">الفواتير</div>
                        </div>
                    </div>
                    <div class="supplier-actions">
                        ${(s.remainingDebt || 0) > 0 ? `
                            <button class="btn btn-sm btn-primary" onclick="SuppliersModule.showPayModal(${s.id})">
                                <i class="fas fa-credit-card"></i> تسجيل دفعة
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline" onclick="SuppliersModule.showHistory(${s.id})">
                            <i class="fas fa-history"></i> السجل
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    showAddSupplierModal() {
        app.showModal('إضافة مورد', `
            <div class="form-group">
                <label>اسم المورد</label>
                <input type="text" class="form-control" id="newSupplierName" placeholder="مثال: شركة الجملة للأزياء">
            </div>
            <button class="btn btn-success btn-block" onclick="SuppliersModule.addSupplier()">
                <i class="fas fa-save"></i> إضافة المورد
            </button>
        `);
    },

    addSupplier() {
        const name = document.getElementById('newSupplierName').value.trim();
        if (!name) { app.showToast('الرجاء إدخال اسم المورد', 'error'); return; }

        const maxId = DataStore.suppliers.length > 0 ? Math.max(...DataStore.suppliers.map(s => s.id)) : 0;
        DataStore.suppliers.push({ id: maxId + 1, name, totalPurchases: 0, totalPaid: 0, remainingDebt: 0 });
        DataStore.save();

        app.closeModal();
        app.showToast(`تمت إضافة المورد "${name}"!`, 'success');
        DataStore.addLog({ type: 'supplier', action: 'تمت إضافة مورد', details: name, userId: Auth.getUserId() });

        if (app.currentPage === 'suppliers') this.render();
    },

    showPayModal(supplierId) {
        const supplier = DataStore.getSupplier(supplierId);
        if (!supplier) return;

        const modal = document.getElementById('modalOverlay');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-credit-card"></i> تسجيل دفعة - ${supplier.name}</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="debt-info-box">
                        <div class="row">
                            <span>المتبقي الحالي</span>
                            <span style="color:var(--danger);font-weight:700">${supplier.remainingDebt} ج.م</span>
                        </div>
                        <div class="row">
                            <span>إجمالي المشتريات</span>
                            <span>${supplier.totalPurchases} ج.م</span>
                        </div>
                        <div class="row">
                            <span>إجمالي المدفوع</span>
                            <span>${supplier.totalPaid} ج.م</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>مبلغ الدفعة (ج.م)</label>
                        <input type="number" class="form-control" id="payAmount" value="${supplier.remainingDebt}" min="0" max="${supplier.remainingDebt}" step="1">
                    </div>
                    <div class="form-group">
                        <label>ملاحظة الدفعة</label>
                        <input type="text" class="form-control" id="payNote" placeholder="مثال: دفعة جزئية للفاتورة INV-001">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="app.closeModal()">إلغاء</button>
                    <button class="btn btn-success" onclick="SuppliersModule.confirmPayment(${supplierId})">
                        <i class="fas fa-check-circle"></i> تسجيل الدفعة
                    </button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },

    confirmPayment(supplierId) {
        const amount = parseInt(document.getElementById('payAmount').value);
        const note = document.getElementById('payNote').value.trim();

        if (!amount || amount <= 0) {
            app.showToast('الرجاء إدخال مبلغ دفع صحيح', 'error');
            return;
        }

        const supplier = DataStore.getSupplier(supplierId);
        if (amount > supplier.remainingDebt) {
            app.showToast('مبلغ الدفعة لا يمكن أن يتجاوز المبلغ المتبقي', 'error');
            return;
        }

        DataStore.addPayment({ supplierId, amount, note: note || `دفعة بقيمة ${amount} ج.م`, userId: Auth.getUserId() });
        DataStore.updateSupplierDebt(supplierId);

        DataStore.addLog({
            type: 'payment',
            action: 'تم تسجيل دفعة مورد',
            details: `${supplier.name} - ${amount} ج.م (المتبقي: ${supplier.remainingDebt - amount} ج.م)`,
            userId: Auth.getUserId()
        });

        app.closeModal();
        app.showToast(`تم تسجيل دفعة بقيمة ${amount} ج.م لـ ${supplier.name}!`, 'success');
        if (app.currentPage === 'suppliers') this.render();
    },

    showHistory(supplierId) {
        const supplier = DataStore.getSupplier(supplierId);
        const purchases = DataStore.purchases.filter(p => p.supplierId === supplierId);
        const payments = DataStore.payments.filter(p => p.supplierId === supplierId);

        let html = `<div style="max-height:500px;overflow-y:auto">`;

        html += `<h4 style="margin:0 0 10px;color:var(--gray-700)"><i class="fas fa-file-invoice"></i> فواتير المشتريات</h4>`;
        if (purchases.length === 0) {
            html += `<p style="color:var(--gray-400);font-size:13px">لا توجد مشتريات بعد</p>`;
        } else {
            purchases.forEach(p => {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:13px">
                        <span>${p.invoiceNumber || 'N/A'} - ${new Date(p.date).toLocaleDateString('ar-SA')}</span>
                        <span>${p.totalCost} ج.م (مدفوع: ${p.amountPaid} ج.م)</span>
                    </div>
                `;
            });
        }

        html += `<h4 style="margin:16px 0 10px;color:var(--gray-700)"><i class="fas fa-credit-card"></i> سجل المدفوعات</h4>`;
        if (payments.length === 0) {
            html += `<p style="color:var(--gray-400);font-size:13px">لا توجد مدفوعات بعد</p>`;
        } else {
            payments.forEach(p => {
                html += `
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:13px">
                        <span>${new Date(p.date).toLocaleDateString('ar-SA')} ${p.note ? '- ' + p.note : ''}</span>
                        <span style="color:var(--success);font-weight:600">-${p.amount} ج.م</span>
                    </div>
                `;
            });
        }

        html += `
            <div style="border-top:2px solid var(--gray-200);margin-top:12px;padding-top:12px">
                <div style="display:flex;justify-content:space-between;font-size:14px">
                    <span><strong>المتبقي الحالي:</strong></span>
                    <span style="color:var(--danger);font-weight:700">${supplier.remainingDebt} ج.م</span>
                </div>
            </div>
        `;

        html += `</div>`;

        app.showModal(`${supplier.name} - السجل`, html);
    }
};
