// ============================
// وحدة المشتريات - فواتير شراء من الموردين
// ============================

const PurchasesModule = {
    invoiceItems: [],

    render() {
        this.invoiceItems = [];
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-truck-loading"></i> فواتير المشتريات</h1>
                    <p>تسجيل المشتريات من الموردين وإدارة المخزون - ادفع واستلم المنتجات فوراً</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-success" onclick="PurchasesModule.showReceivePurchaseModal()">
                        <i class="fas fa-box-open"></i> استلام مشتريات + دفع
                    </button>
                    <button class="btn btn-primary" onclick="PurchasesModule.showNewInvoiceModal()">
                        <i class="fas fa-plus"></i> فاتورة مشتريات جديدة
                    </button>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>رقم الفاتورة</th>
                                    <th>المورد</th>
                                    <th>التاريخ</th>
                                    <th>المنتجات</th>
                                    <th>التكلفة الإجمالية</th>
                                    <th>المدفوع</th>
                                    <th>المتبقي</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderInvoiceRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderInvoiceRows() {
        if (DataStore.purchases.length === 0) {
            return `<tr><td colspan="9" class="empty-state"><i class="fas fa-receipt"></i><h3>لا توجد فواتير مشتريات بعد</h3><p>استخدم زر "استلام مشتريات + دفع" لشراء منتجات جديدة</p></td></tr>`;
        }

        return DataStore.purchases.map(p => {
            const supplier = DataStore.getSupplier(p.supplierId);
            const items = DataStore.purchaseItems.filter(i => i.purchaseId === p.id);
            const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
            const status = p.remainingDebt <= 0 ? 'مدفوعة ومستلمة ✓' : `ديون: ${p.remainingDebt} ج.م`;
            const statusClass = p.remainingDebt <= 0 ? 'badge-success' : 'badge-warning';
            return `
                <tr>
                    <td><strong>${p.invoiceNumber || 'N/A'}</strong></td>
                    <td>${supplier ? supplier.name : 'غير معروف'}</td>
                    <td>${new Date(p.date).toLocaleDateString('ar-SA')}</td>
                    <td>${totalItems}</td>
                    <td>${p.totalCost} ج.م</td>
                    <td>${p.amountPaid || 0} ج.م</td>
                    <td>${p.remainingDebt || 0} ج.م</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="PurchasesModule.showReceipt(${p.id})">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // ============================
    // استلام مشتريات + دفع مباشر
    // ============================
    showReceivePurchaseModal() {
        this.invoiceItems = [];
        const modal = document.getElementById('modalOverlay');
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h2><i class="fas fa-box-open" style="color:var(--success)"></i> استلام مشتريات + دفع</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background:linear-gradient(135deg,#dcfce7,#bbf7d0);padding:14px 18px;border-radius:var(--radius-sm);margin-bottom:18px">
                        <div style="display:flex;align-items:center;gap:10px">
                            <i class="fas fa-info-circle" style="color:var(--success-dark);font-size:20px"></i>
                            <div>
                                <strong style="color:var(--success-dark);font-size:14px">💰 ادفع واستلم المنتجات فوراً!</strong>
                                <p style="color:var(--success-dark);font-size:12px;margin-top:2px">عند تأكيد الدفع، ستتم إضافة المنتجات إلى المخزون تلقائياً</p>
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-building"></i> المورد</label>
                            <select class="form-control" id="receiveSupplier">
                                <option value="">اختر المورد...</option>
                                ${DataStore.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-hashtag"></i> رقم إذن الاستلام</label>
                            <input type="text" class="form-control" id="receiveInvoiceNumber" value="RCP-${String(DataStore.purchases.length + 1).padStart(3, '0')}" readonly>
                        </div>
                    </div>

                    <h3 style="font-size:16px;font-weight:700;margin:18px 0 12px;color:var(--gray-700)">
                        <i class="fas fa-shopping-basket" style="color:var(--primary)"></i> المنتجات المستلمة
                    </h3>

                    <div class="invoice-items" id="receiveItemsList">
                        <div class="invoice-item-row invoice-item-row-header">
                            <span>المنتج</span>
                            <span>اللون</span>
                            <span>المقاس</span>
                            <span>الكمية</span>
                            <span>سعر الوحدة</span>
                            <span>الإجمالي</span>
                            <span></span>
                        </div>
                    </div>

                    <div class="invoice-item-row" style="background:transparent;padding:12px 4px">
                        <select class="form-control form-control-sm" id="rcvProduct" onchange="PurchasesModule.suggestCost()">
                            <option value="">اختر...</option>
                            ${DataStore.products.map(p => `<option value="${p.id}" data-cost="${p.costPrice}">${p.name}</option>`).join('')}
                        </select>
                        <input type="text" class="form-control form-control-sm" id="rcvColor" placeholder="اللون">
                        <input type="text" class="form-control form-control-sm" id="rcvSize" placeholder="المقاس">
                        <input type="number" class="form-control form-control-sm" id="rcvQty" placeholder="ك" min="1" value="1">
                        <input type="number" class="form-control form-control-sm" id="rcvCost" placeholder="ج.م" min="0" step="1">
                        <button class="btn btn-sm btn-success" onclick="PurchasesModule.addReceiveItem()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>

                    <div style="margin-top:16px;padding:16px;background:var(--gray-50);border-radius:var(--radius-sm)">
                        <div style="display:flex;justify-content:space-between;font-size:16px">
                            <span><strong>إجمالي تكلفة المنتجات:</strong></span>
                            <span><strong id="receiveTotalCost" style="color:var(--primary);font-size:18px">0 ج.م</strong></span>
                        </div>
                    </div>

                    <h3 style="font-size:16px;font-weight:700;margin:18px 0 12px;color:var(--gray-700)">
                        <i class="fas fa-credit-card" style="color:var(--success)"></i> الدفع
                    </h3>

                    <div class="form-row-3">
                        <div class="form-group">
                            <label>💵 المبلغ المدفوع الآن (ج.م)</label>
                            <input type="number" class="form-control" id="receiveAmountPaid" value="0" min="0" step="1" style="font-size:18px;font-weight:700;color:var(--success)">
                        </div>
                        <div class="form-group">
                            <label>🔴 المبلغ المتبقي (ج.م)</label>
                            <input type="text" class="form-control" id="receiveRemaining" value="0" readonly style="color:var(--danger);font-weight:700;font-size:18px">
                        </div>
                        <div class="form-group">
                            <label>📋 طريقة الدفع</label>
                            <select class="form-control" id="receivePaymentMethod">
                                <option value="cash">نقداً</option>
                                <option value="bank">تحويل بنكي</option>
                                <option value="check">شيك</option>
                            </select>
                        </div>
                    </div>

                    <div style="background:#fef3c7;padding:12px 16px;border-radius:var(--radius-sm);margin-top:8px">
                        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#92400e">
                            <i class="fas fa-lightbulb"></i>
                            <span>💡 ادفع كامل المبلغ لتصفية الفاتورة بالكامل. يمكنك دفع جزء الآن والباقي لاحقاً.</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="app.closeModal()">إلغاء</button>
                    <button class="btn btn-success" onclick="PurchasesModule.confirmReceive()" style="padding:12px 28px;font-size:15px">
                        <i class="fas fa-check-circle"></i> تأكيد الدفع والاستلام
                    </button>
                </div>
            </div>
        `;
        modal.classList.add('active');

        document.getElementById('receiveAmountPaid').addEventListener('input', () => this.updateReceiveDebt());
        // Auto suggest full payment
        setTimeout(() => {
            const total = this.invoiceItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
            document.getElementById('receiveAmountPaid').value = total;
            this.updateReceiveDebt();
        }, 100);
    },

    suggestCost() {
        const select = document.getElementById('rcvProduct');
        const option = select.options[select.selectedIndex];
        if (option && option.dataset.cost) {
            document.getElementById('rcvCost').value = option.dataset.cost;
        }
    },

    addReceiveItem() {
        const productSelect = document.getElementById('rcvProduct');
        const color = document.getElementById('rcvColor').value.trim();
        const size = document.getElementById('rcvSize').value.trim();
        const qty = parseInt(document.getElementById('rcvQty').value) || 1;
        const cost = parseInt(document.getElementById('rcvCost').value) || 0;

        const productId = parseInt(productSelect.value);
        if (!productId || !color || !size || qty <= 0 || cost <= 0) {
            app.showToast('الرجاء ملء جميع حقول المنتج بشكل صحيح', 'error');
            return;
        }

        const product = DataStore.products.find(p => p.id === productId);
        if (!product) return;

        this.invoiceItems.push({ productId, productName: product.name, color, size, quantity: qty, costPrice: cost });

        document.getElementById('rcvColor').value = '';
        document.getElementById('rcvSize').value = '';
        document.getElementById('rcvQty').value = '1';
        document.getElementById('rcvCost').value = '';
        document.getElementById('rcvProduct').value = '';

        this.renderReceiveItems();
        this.updateReceiveDebt();
        app.showToast(`✅ تمت إضافة "${product.name}" (${color}/${size} x${qty}) بسعر ${cost} ج.م للقطعة`, 'success');
    },

    removeReceiveItem(index) {
        this.invoiceItems.splice(index, 1);
        this.renderReceiveItems();
        this.updateReceiveDebt();
    },

    renderReceiveItems() {
        const container = document.getElementById('receiveItemsList');
        const header = `<div class="invoice-item-row invoice-item-row-header">
            <span>المنتج</span><span>اللون</span><span>المقاس</span><span>الكمية</span><span>سعر الوحدة</span><span>الإجمالي</span><span></span>
        </div>`;

        let itemsHtml = '';
        let total = 0;

        this.invoiceItems.forEach((item, index) => {
            const lineTotal = item.quantity * item.costPrice;
            total += lineTotal;
            itemsHtml += `
                <div class="invoice-item-row">
                    <span><strong>${item.productName}</strong></span>
                    <span>${item.color}</span>
                    <span>${item.size}</span>
                    <span><strong>x${item.quantity}</strong></span>
                    <span>${item.costPrice} ج.م</span>
                    <span><strong>${lineTotal} ج.م</strong></span>
                    <button class="btn btn-sm btn-danger" onclick="PurchasesModule.removeReceiveItem(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        container.innerHTML = header + (itemsHtml || '<div style="padding:12px;text-align:center;color:var(--gray-400);font-size:13px">⚠️ لم تتم إضافة منتجات بعد - أضف المنتجات التي تستلمها</div>');
        document.getElementById('receiveTotalCost').textContent = `${total} ج.م`;
    },

    updateReceiveDebt() {
        const totalCost = this.invoiceItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const paid = parseInt(document.getElementById('receiveAmountPaid').value) || 0;
        const debt = Math.max(0, totalCost - paid);
        document.getElementById('receiveRemaining').value = debt;

        // Visual feedback on payment status
        const remainingInput = document.getElementById('receiveRemaining');
        if (debt === 0 && totalCost > 0) {
            remainingInput.style.color = 'var(--success)';
        } else {
            remainingInput.style.color = 'var(--danger)';
        }
    },

    confirmReceive() {
        const supplierId = parseInt(document.getElementById('receiveSupplier').value);
        if (!supplierId) { app.showToast('⚠️ الرجاء اختيار المورد', 'error'); return; }
        if (this.invoiceItems.length === 0) { app.showToast('⚠️ الرجاء إضافة منتج واحد على الأقل', 'error'); return; }

        const totalCost = this.invoiceItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const paid = parseInt(document.getElementById('receiveAmountPaid').value) || 0;
        const debt = Math.max(0, totalCost - paid);
        const invoiceNumber = document.getElementById('receiveInvoiceNumber').value;
        const paymentMethod = document.getElementById('receivePaymentMethod').value;
        const paymentMethodText = { cash: 'نقداً', bank: 'تحويل بنكي', check: 'شيك' }[paymentMethod] || 'نقداً';

        // Create purchase record
        const purchase = DataStore.addPurchase({
            supplierId,
            totalCost,
            amountPaid: paid,
            remainingDebt: debt,
            userId: Auth.getUserId(),
            invoiceNumber
        });

        // Add stock and record each item
        let itemsDetails = [];
        this.invoiceItems.forEach(item => {
            DataStore.addPurchaseItem({
                purchaseId: purchase.id,
                productId: item.productId,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                costPrice: item.costPrice
            });
            DataStore.adjustStock(item.productId, item.color, item.size, item.quantity);
            itemsDetails.push(`${item.productName} (${item.color}/${item.size}) x${item.quantity}`);
        });

        // Update supplier debt
        DataStore.updateSupplierDebt(supplierId);

        // If there's a payment, record it
        if (paid > 0) {
            DataStore.addPayment({
                supplierId,
                amount: paid,
                note: `دفعة فاتورة ${invoiceNumber} - ${paymentMethodText}`,
                userId: Auth.getUserId()
            });
        }

        // Log
        const statusText = debt === 0 ? 'مدفوعة بالكامل ✓' : `متبقي ${debt} ج.م`;
        DataStore.addLog({
            type: 'purchase',
            action: '📦 استلام مشتريات ودفع',
            details: `${invoiceNumber} - ${DataStore.getSupplier(supplierId).name} - ${totalCost} ج.م (مدفوع: ${paid} ج.م - ${statusText})`,
            userId: Auth.getUserId()
        });

        app.closeModal();
        this.invoiceItems = [];

        // Show beautiful receipt
        this.showReceiptModal({
            invoiceNumber,
            supplierName: DataStore.getSupplier(supplierId).name,
            date: new Date().toLocaleDateString('ar-SA'),
            items: itemsDetails,
            totalCost,
            paid,
            debt,
            paymentMethod: paymentMethodText,
            status: statusText
        });

        if (app.currentPage === 'purchases') this.render();
    },

    // ============================
    // إظهار وصول الاستلام (Receipt)
    // ============================
    showReceiptModal(data) {
        const modal = document.getElementById('modalOverlay');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header" style="background:linear-gradient(135deg,var(--success),var(--success-dark));color:white">
                    <h2 style="color:white"><i class="fas fa-check-circle"></i> تم الاستلام والدفع بنجاح ✓</h2>
                    <button class="modal-close" onclick="app.closeModal()" style="color:white;font-size:28px">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align:center;padding:16px 0">
                        <i class="fas fa-tshirt" style="font-size:48px;color:var(--primary);background:var(--primary-light);padding:16px;border-radius:16px;margin-bottom:12px;display:inline-block"></i>
                        <h3 style="font-size:20px;font-weight:800;color:var(--gray-900);margin-bottom:4px">إذن استلام مشتريات</h3>
                        <p style="color:var(--gray-500);font-size:14px">${data.invoiceNumber}</p>
                    </div>

                    <div style="border-top:2px dashed var(--gray-200);border-bottom:2px dashed var(--gray-200);padding:16px 0;margin-bottom:16px">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px">
                            <span style="color:var(--gray-500)">المورد:</span>
                            <span style="font-weight:700">${data.supplierName}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px">
                            <span style="color:var(--gray-500)">التاريخ:</span>
                            <span style="font-weight:700">${data.date}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px">
                            <span style="color:var(--gray-500)">طريقة الدفع:</span>
                            <span style="font-weight:700">${data.paymentMethod}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:14px">
                            <span style="color:var(--gray-500)">الحالة:</span>
                            <span style="font-weight:700;color:${data.debt === 0 ? 'var(--success)' : 'var(--warning)'}">${data.status}</span>
                        </div>
                    </div>

                    <h4 style="font-size:14px;font-weight:700;margin-bottom:10px">🛍️ المنتجات المستلمة:</h4>
                    <div style="margin-bottom:16px">
                        ${data.items.map((item, i) => `
                            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
                                <span style="width:24px;height:24px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">${i+1}</span>
                                <span style="font-size:14px">${item}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div style="background:var(--gray-50);border-radius:var(--radius-sm);padding:16px">
                        <div style="display:flex;justify-content:space-between;font-size:15px;margin-bottom:6px">
                            <span>💰 الإجمالي:</span>
                            <span style="font-weight:700">${data.totalCost} ج.م</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:15px;margin-bottom:6px">
                            <span>💵 المدفوع:</span>
                            <span style="font-weight:700;color:var(--success)">${data.paid} ج.م</span>
                        </div>
                        ${data.debt > 0 ? `
                        <div style="display:flex;justify-content:space-between;font-size:15px;border-top:2px solid var(--gray-200);padding-top:6px;margin-top:6px">
                            <span>🔴 المتبقي:</span>
                            <span style="font-weight:700;color:var(--danger)">${data.debt} ج.م</span>
                        </div>
                        ` : `
                        <div style="display:flex;justify-content:space-between;font-size:15px;border-top:2px solid var(--gray-200);padding-top:6px;margin-top:6px">
                            <span>✅ الحالة:</span>
                            <span style="font-weight:700;color:var(--success)">مدفوعة بالكامل ✓</span>
                        </div>
                        `}
                    </div>

                    <div style="text-align:center;margin-top:6px;font-size:12px;color:var(--gray-400)">
                        <i class="fas fa-check-circle" style="color:var(--success)"></i> تمت إضافة ${data.items.length} منتجات إلى المخزون
                    </div>
                </div>
                <div class="modal-footer" style="justify-content:center">
                    <button class="btn btn-success" onclick="app.closeModal()">
                        <i class="fas fa-check"></i> تم
                    </button>
                    <button class="btn btn-outline" onclick="window.print()">
                        <i class="fas fa-print"></i> طباعة
                    </button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },

    showReceipt(purchaseId) {
        const purchase = DataStore.purchases.find(p => p.id === purchaseId);
        if (!purchase) return;
        const supplier = DataStore.getSupplier(purchase.supplierId);
        const items = DataStore.purchaseItems.filter(i => i.purchaseId === purchaseId);

        const itemsDetails = items.map(i => {
            const product = DataStore.products.find(p => p.id === i.productId);
            return `${product ? product.name : 'غير معروف'} (${i.color}/${i.size}) x${i.quantity} - ${i.costPrice * i.quantity} ج.م`;
        });

        this.showReceiptModal({
            invoiceNumber: purchase.invoiceNumber,
            supplierName: supplier ? supplier.name : 'غير معروف',
            date: new Date(purchase.date).toLocaleDateString('ar-SA'),
            items: itemsDetails,
            totalCost: purchase.totalCost,
            paid: purchase.amountPaid || 0,
            debt: purchase.remainingDebt || 0,
            paymentMethod: '—',
            status: purchase.remainingDebt <= 0 ? 'مدفوعة بالكامل ✓' : `متبقي ${purchase.remainingDebt} ج.م`
        });
    },

    // ============================
    // الفاتورة العادية
    // ============================
    showNewInvoiceModal() {
        this.invoiceItems = [];
        const modal = document.getElementById('modalOverlay');
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h2><i class="fas fa-file-invoice"></i> فاتورة مشتريات جديدة</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label>المورد</label>
                            <select class="form-control" id="purchaseSupplier">
                                <option value="">اختر المورد...</option>
                                ${DataStore.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>رقم الفاتورة</label>
                            <input type="text" class="form-control" id="purchaseInvoiceNumber" value="INV-${String(DataStore.purchases.length + 1).padStart(3, '0')}" readonly>
                        </div>
                    </div>

                    <h3 style="font-size:15px;font-weight:600;margin:16px 0 10px;color:var(--gray-700)">
                        <i class="fas fa-shopping-basket"></i> المنتجات
                    </h3>

                    <div class="invoice-items" id="invoiceItemsList">
                        <div class="invoice-item-row invoice-item-row-header">
                            <span>المنتج</span>
                            <span>اللون</span>
                            <span>المقاس</span>
                            <span>الكمية</span>
                            <span>التكلفة</span>
                            <span></span>
                        </div>
                    </div>

                    <div class="invoice-item-row" style="background:transparent;padding:12px 4px">
                        <select class="form-control form-control-sm" id="invProduct">
                            <option value="">اختر...</option>
                            ${DataStore.products.map(p => `<option value="${p.id}" data-cost="${p.costPrice}">${p.name}</option>`).join('')}
                        </select>
                        <input type="text" class="form-control form-control-sm" id="invColor" placeholder="اللون">
                        <input type="text" class="form-control form-control-sm" id="invSize" placeholder="المقاس">
                        <input type="number" class="form-control form-control-sm" id="invQty" placeholder="الكمية" min="1" value="1">
                        <input type="number" class="form-control form-control-sm" id="invCost" placeholder="ج.م" min="0" step="1">
                        <button class="btn btn-sm btn-primary" onclick="PurchasesModule.addInvoiceItem()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>

                    <div style="margin-top:16px;padding:14px;background:var(--gray-50);border-radius:var(--radius-sm)">
                        <div style="display:flex;justify-content:space-between;font-size:15px">
                            <span><strong>إجمالي تكلفة المنتجات:</strong></span>
                            <span><strong id="invoiceTotalCost">0 ج.م</strong></span>
                        </div>
                    </div>

                    <h3 style="font-size:15px;font-weight:600;margin:16px 0 10px;color:var(--gray-700)">
                        <i class="fas fa-money-bill"></i> الدفع
                    </h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>المبلغ المدفوع (ج.م)</label>
                            <input type="number" class="form-control" id="purchaseAmountPaid" value="0" min="0" step="1">
                        </div>
                        <div class="form-group">
                            <label>المبلغ المتبقي (ج.م)</label>
                            <input type="text" class="form-control" id="purchaseRemainingDebt" value="0" readonly style="color:var(--danger);font-weight:700">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="app.closeModal()">إلغاء</button>
                    <button class="btn btn-success" onclick="PurchasesModule.confirmInvoice()">
                        <i class="fas fa-check-circle"></i> تأكيد الفاتورة
                    </button>
                </div>
            </div>
        `;
        modal.classList.add('active');

        document.getElementById('purchaseAmountPaid').addEventListener('input', () => this.updateDebtCalculation());
    },

    addInvoiceItem() {
        const productSelect = document.getElementById('invProduct');
        const color = document.getElementById('invColor').value.trim();
        const size = document.getElementById('invSize').value.trim();
        const qty = parseInt(document.getElementById('invQty').value) || 1;
        const cost = parseInt(document.getElementById('invCost').value) || 0;

        const productId = parseInt(productSelect.value);
        if (!productId || !color || !size || qty <= 0 || cost <= 0) {
            app.showToast('الرجاء ملء جميع حقول المنتج', 'error');
            return;
        }

        const product = DataStore.products.find(p => p.id === productId);
        if (!product) return;

        this.invoiceItems.push({ productId, productName: product.name, color, size, quantity: qty, costPrice: cost });

        document.getElementById('invColor').value = '';
        document.getElementById('invSize').value = '';
        document.getElementById('invQty').value = '1';
        document.getElementById('invCost').value = '';

        this.renderInvoiceItems();
        this.updateDebtCalculation();
        app.showToast(`تمت إضافة "${product.name}" (${color}/${size} x${qty})`, 'success');
    },

    removeInvoiceItem(index) {
        this.invoiceItems.splice(index, 1);
        this.renderInvoiceItems();
        this.updateDebtCalculation();
    },

    renderInvoiceItems() {
        const container = document.getElementById('invoiceItemsList');
        const header = `<div class="invoice-item-row invoice-item-row-header">
            <span>المنتج</span><span>اللون</span><span>المقاس</span><span>الكمية</span><span>التكلفة</span><span></span>
        </div>`;

        let itemsHtml = '';
        let total = 0;

        this.invoiceItems.forEach((item, index) => {
            const lineTotal = item.quantity * item.costPrice;
            total += lineTotal;
            itemsHtml += `
                <div class="invoice-item-row">
                    <span><strong>${item.productName}</strong></span>
                    <span>${item.color}</span>
                    <span>${item.size}</span>
                    <span>x${item.quantity}</span>
                    <span>${lineTotal} ج.م</span>
                    <button class="btn btn-sm btn-danger" onclick="PurchasesModule.removeInvoiceItem(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        container.innerHTML = header + (itemsHtml || '<div style="padding:12px;text-align:center;color:var(--gray-400);font-size:13px">لم تتم إضافة منتجات بعد</div>');
        document.getElementById('invoiceTotalCost').textContent = `${total} ج.م`;
    },

    updateDebtCalculation() {
        const totalCost = this.invoiceItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const paid = parseInt(document.getElementById('purchaseAmountPaid').value) || 0;
        const debt = Math.max(0, totalCost - paid);
        document.getElementById('purchaseRemainingDebt').value = debt;
    },

    confirmInvoice() {
        const supplierId = parseInt(document.getElementById('purchaseSupplier').value);
        if (!supplierId) { app.showToast('الرجاء اختيار المورد', 'error'); return; }
        if (this.invoiceItems.length === 0) { app.showToast('الرجاء إضافة منتج واحد على الأقل', 'error'); return; }

        const totalCost = this.invoiceItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const paid = parseInt(document.getElementById('purchaseAmountPaid').value) || 0;
        const debt = Math.max(0, totalCost - paid);
        const invoiceNumber = document.getElementById('purchaseInvoiceNumber').value;

        const purchase = DataStore.addPurchase({ supplierId, totalCost, amountPaid: paid, remainingDebt: debt, userId: Auth.getUserId(), invoiceNumber });

        this.invoiceItems.forEach(item => {
            DataStore.addPurchaseItem({ purchaseId: purchase.id, productId: item.productId, color: item.color, size: item.size, quantity: item.quantity, costPrice: item.costPrice });
            DataStore.adjustStock(item.productId, item.color, item.size, item.quantity);
        });

        DataStore.updateSupplierDebt(supplierId);

        const details = `${invoiceNumber} - ${totalCost} ج.م (مدفوع: ${paid} ج.م)`;
        DataStore.addLog({ type: 'purchase', action: 'تم إنشاء فاتورة مشتريات', details, userId: Auth.getUserId() });

        app.closeModal();
        this.invoiceItems = [];
        app.showToast(`تم إنشاء الفاتورة ${invoiceNumber}! تم تحديث المخزون. المتبقي: ${debt} ج.م`, 'success');
        if (app.currentPage === 'purchases') this.render();
    }
};
