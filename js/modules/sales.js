// ============================
// وحدة المبيعات (نقطة البيع)
// ============================

const SalesModule = {
    cart: [],
    selectedProduct: null,
    selectedColor: null,
    selectedSize: null,

    render() {
        this.cart = [];
        this.selectedProduct = null;
        this.selectedColor = null;
        this.selectedSize = null;

        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1><i class="fas fa-shopping-cart"></i> نقطة البيع</h1>
                    <p>اختر المنتجات، وحدد المتغيرات، وأتم عملية البيع</p>
                </div>
            </div>
            <div class="sales-layout">
                <div class="sales-products">
                    <div class="filters-bar" style="margin-bottom:16px">
                        <div class="form-group" style="flex:1">
                            <input type="text" class="form-control" id="salesSearch" placeholder="البحث عن منتجات..." oninput="SalesModule.filterProducts()">
                        </div>
                        <div class="form-group">
                            <select class="form-control" id="salesCategoryFilter" onchange="SalesModule.filterProducts()">
                                <option value="">جميع الفئات</option>
                                ${[...new Set(DataStore.products.map(p => p.category))].map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="salesVariantSelector" style="display:none;margin-bottom:16px">
                        <div class="card">
                            <div class="card-body">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                                    <h3 id="selectedProductName" style="font-size:16px;font-weight:600"></h3>
                                    <button class="btn btn-sm btn-outline" onclick="SalesModule.clearSelection()">
                                        <i class="fas fa-times"></i> إلغاء
                                    </button>
                                </div>
                                <div id="variantOptions" class="variant-selector"></div>
                                <div style="margin-top:12px">
                                    <div class="form-group">
                                        <label>الكمية</label>
                                        <div class="form-inline">
                                            <input type="number" class="form-control" id="salesQty" value="1" min="1" style="max-width:100px">
                                            <button class="btn btn-success" onclick="SalesModule.addToCart()" id="addToCartBtn" disabled>
                                                <i class="fas fa-cart-plus"></i> إضافة للسلة
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="salesProductGrid" class="product-grid"></div>
                </div>
                <div class="sales-cart" id="salesCart">
                    <div class="cart-header">
                        <h3><i class="fas fa-shopping-bag"></i> السلة</h3>
                        <span id="cartCount">0 منتجات</span>
                    </div>
                    <div class="cart-items" id="cartItems">
                        <div class="empty-state">
                            <i class="fas fa-shopping-bag"></i>
                            <h3>السلة فارغة</h3>
                            <p>اختر منتجاً لبدء البيع</p>
                        </div>
                    </div>
                    <div class="cart-footer">
                        <div class="cart-total">
                            <span>الإجمالي</span>
                            <span id="cartTotal">0 ج.م</span>
                        </div>
                        <button class="btn btn-success btn-block" onclick="SalesModule.checkout()" id="checkoutBtn" disabled>
                            <i class="fas fa-check-circle"></i> تأكيد البيع
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderProducts();
    },

    renderProducts(filter = '') {
        const grid = document.getElementById('salesProductGrid');
        let products = DataStore.products;

        const search = document.getElementById('salesSearch')?.value?.toLowerCase() || '';
        const category = document.getElementById('salesCategoryFilter')?.value || '';

        if (search) products = products.filter(p => p.name.toLowerCase().includes(search));
        if (category) products = products.filter(p => p.category === category);

        grid.innerHTML = products.map(p => {
            const variants = DataStore.getProductVariants(p.id);
            const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
            return `
                <div class="product-card" onclick="SalesModule.selectProduct(${p.id})">
                    <div class="product-icon"><i class="fas fa-tshirt"></i></div>
                    <h4>${p.name}</h4>
                    <div class="product-category">${p.category}</div>
                    <div class="product-price">${p.sellingPrice} ج.م <small>تكلفة ${p.costPrice} ج.م</small></div>
                    <div style="font-size:12px;color:var(--gray-500);margin-top:6px">
                        <span class="badge ${totalStock > 0 ? 'badge-success' : 'badge-danger'}">المخزون: ${totalStock}</span>
                    </div>
                </div>
            `;
        }).join('');

        if (products.length === 0) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><h3>لا توجد منتجات</h3></div>`;
        }
    },

    filterProducts() {
        this.renderProducts();
    },

    selectProduct(productId) {
        const product = DataStore.products.find(p => p.id === productId);
        if (!product) return;

        this.selectedProduct = product;
        this.selectedColor = null;
        this.selectedSize = null;

        document.getElementById('salesVariantSelector').style.display = 'block';
        document.getElementById('selectedProductName').textContent = `${product.name} - ${product.sellingPrice} ج.م`;
        document.getElementById('addToCartBtn').disabled = true;

        this.renderVariants();
    },

    renderVariants() {
        const container = document.getElementById('variantOptions');
        if (!this.selectedProduct) return;

        const colors = DataStore.getProductColors(this.selectedProduct.id);
        const sizes = this.selectedColor ? DataStore.getProductSizes(this.selectedProduct.id, this.selectedColor) : [];

        let html = '';

        html += `<div class="variant-group">
            <label>اللون</label>
            <div class="variant-options">
                ${colors.length > 0 ? colors.map(c => `
                    <div class="variant-chip ${this.selectedColor === c ? 'active' : ''}" onclick="SalesModule.selectColor('${c}')">
                        ${c}
                    </div>
                `).join('') : '<span style="color:var(--gray-400);font-size:13px">لا توجد ألوان متاحة</span>'}
            </div>
        </div>`;

        if (this.selectedColor) {
            html += `<div class="variant-group">
                <label>المقاس</label>
                <div class="variant-options">
                    ${sizes.length > 0 ? sizes.map(s => {
                        const stock = DataStore.getStock(this.selectedProduct.id, this.selectedColor, s);
                        return `
                            <div class="variant-chip ${this.selectedSize === s ? 'active' : ''}" onclick="SalesModule.selectSize('${s}')">
                                ${s} <span class="stock-badge">${stock}</span>
                            </div>
                        `;
                    }).join('') : '<span style="color:var(--gray-400);font-size:13px">لا توجد مقاسات متاحة</span>'}
                </div>
            </div>`;
        }

        container.innerHTML = html;
    },

    selectColor(color) {
        this.selectedColor = color;
        this.selectedSize = null;
        document.getElementById('addToCartBtn').disabled = true;
        this.renderVariants();
    },

    selectSize(size) {
        this.selectedSize = size;
        const stock = DataStore.getStock(this.selectedProduct.id, this.selectedColor, size);
        document.getElementById('addToCartBtn').disabled = stock <= 0;
        if (stock <= 0) {
            app.showToast('هذا المتغير غير متوفر في المخزون!', 'error');
        }
        this.renderVariants();
    },

    clearSelection() {
        this.selectedProduct = null;
        this.selectedColor = null;
        this.selectedSize = null;
        document.getElementById('salesVariantSelector').style.display = 'none';
    },

    addToCart() {
        if (!this.selectedProduct || !this.selectedColor || !this.selectedSize) {
            app.showToast('الرجاء اختيار المنتج واللون والمقاس', 'error');
            return;
        }

        const qty = parseInt(document.getElementById('salesQty').value) || 1;
        const stock = DataStore.getStock(this.selectedProduct.id, this.selectedColor, this.selectedSize);

        if (qty <= 0) { app.showToast('الكمية غير صحيحة', 'error'); return; }
        if (qty > stock) { app.showToast('الكمية غير متوفرة في المخزون!', 'error'); return; }

        const existing = this.cart.find(c =>
            c.productId === this.selectedProduct.id &&
            c.color === this.selectedColor &&
            c.size === this.selectedSize
        );

        if (existing) {
            if (existing.quantity + qty > stock) {
                app.showToast('الكمية الإضافية غير متوفرة في المخزون!', 'error');
                return;
            }
            existing.quantity += qty;
        } else {
            this.cart.push({
                productId: this.selectedProduct.id,
                productName: this.selectedProduct.name,
                color: this.selectedColor,
                size: this.selectedSize,
                quantity: qty,
                sellingPrice: this.selectedProduct.sellingPrice,
                costPrice: this.selectedProduct.costPrice
            });
        }

        this.renderCart();
        this.clearSelection();
        app.showToast('تمت الإضافة إلى السلة!', 'success');
    },

    renderCart() {
        const container = document.getElementById('cartItems');
        const count = document.getElementById('cartCount');
        const total = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>السلة فارغة</h3>
                    <p>اختر منتجاً لبدء البيع</p>
                </div>
            `;
            count.textContent = '0 منتجات';
            total.textContent = '0 ج.م';
            checkoutBtn.disabled = true;
            return;
        }

        const totalQty = this.cart.reduce((sum, c) => sum + c.quantity, 0);
        const totalAmount = this.cart.reduce((sum, c) => sum + (c.sellingPrice * c.quantity), 0);

        count.textContent = `${totalQty} منتجات`;
        total.textContent = `${totalAmount} ج.م`;
        checkoutBtn.disabled = false;

        container.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.productName}</h4>
                    <p>${item.color} / ${item.size} - ${item.sellingPrice} ج.م للقطعة</p>
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                    <div class="cart-item-qty">
                        <button onclick="SalesModule.changeQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="SalesModule.changeQty(${index}, 1)">+</button>
                    </div>
                    <button class="cart-item-delete" onclick="SalesModule.removeItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    changeQty(index, delta) {
        const item = this.cart[index];
        if (!item) return;

        const newQty = item.quantity + delta;
        const stock = DataStore.getStock(item.productId, item.color, item.size);

        if (newQty <= 0) {
            this.cart.splice(index, 1);
        } else if (newQty > stock) {
            app.showToast('الكمية غير متوفرة في المخزون!', 'error');
            return;
        } else {
            item.quantity = newQty;
        }

        this.renderCart();
    },

    removeItem(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    },

    checkout() {
        if (this.cart.length === 0) {
            app.showToast('السلة فارغة', 'error');
            return;
        }

        const total = this.cart.reduce((sum, c) => sum + (c.sellingPrice * c.quantity), 0);
        const totalCost = this.cart.reduce((sum, c) => sum + (c.costPrice * c.quantity), 0);
        const profit = total - totalCost;

        const itemsHtml = this.cart.map(c =>
            `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid var(--gray-100)">
                <span>${c.productName} (${c.color}/${c.size}) x${c.quantity}</span>
                <span><strong>${c.sellingPrice * c.quantity} ج.م</strong></span>
            </div>`
        ).join('');

        app.showModal('تأكيد البيع', `
            <div style="margin-bottom:16px">
                ${itemsHtml}
            </div>
            <div style="border-top:2px solid var(--gray-200);padding-top:12px">
                <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700">
                    <span>الإجمالي: ${total} ج.م</span>
                    <span style="color:var(--success)">الربح: ${profit} ج.م</span>
                </div>
            </div>
            <div style="margin-top:16px">
                <button class="btn btn-success btn-block" onclick="SalesModule.confirmSale()">
                    <i class="fas fa-check-circle"></i> تأكيد وإتمام البيع
                </button>
            </div>
        `, null, true);
    },

    confirmSale() {
        const total = this.cart.reduce((sum, c) => sum + (c.sellingPrice * c.quantity), 0);
        const totalCost = this.cart.reduce((sum, c) => sum + (c.costPrice * c.quantity), 0);
        const profit = total - totalCost;

        const sale = DataStore.addSale({
            items: this.cart.map(c => ({ ...c })),
            total,
            totalCost,
            profit,
            userId: Auth.getUserId()
        });

        this.cart.forEach(c => {
            DataStore.adjustStock(c.productId, c.color, c.size, -c.quantity);
        });

        const details = `${this.cart.length} منتجات - الإجمالي: ${total} ج.م - الربح: ${profit} ج.م`;
        DataStore.addLog({ type: 'sale', action: 'تم إتمام عملية بيع', details, userId: Auth.getUserId() });

        const saleItems = [...this.cart];
        app.closeModal();
        this.cart = [];
        this.renderCart();

        // Show beautiful sale receipt
        this.showSaleReceipt(saleItems, total, profit, sale.id);
        app.showToast(`✅ تم البيع بنجاح! الربح: ${profit} ج.م`, 'success');
    },

    showSaleReceipt(items, total, profit, saleId) {
        const modal = document.getElementById('modalOverlay');
        modal.innerHTML = `
            <div class="modal" style="max-width:480px">
                <div class="modal-header" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;text-align:center;display:block;padding:24px">
                    <h2 style="color:white;font-size:20px"><i class="fas fa-receipt"></i> فاتورة بيع</h2>
                    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px">رقم: #${String(saleId).padStart(4,'0')}</p>
                    <button class="modal-close" onclick="app.closeModal()" style="color:white;position:absolute;top:12px;left:16px;font-size:28px">&times;</button>
                </div>
                <div class="modal-body" style="padding:20px">
                    <div style="text-align:center;padding:8px 0 16px;border-bottom:2px dashed var(--gray-200)">
                        <i class="fas fa-tshirt" style="font-size:36px;color:var(--primary);margin-bottom:8px"></i>
                        <h3 style="font-size:16px;font-weight:700">نظام إدارة الملابس</h3>
                        <p style="font-size:12px;color:var(--gray-400)">${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}</p>
                    </div>

                    <div style="padding:16px 0;border-bottom:2px dashed var(--gray-200)">
                        <table style="width:100%;font-size:13px">
                            <thead>
                                <tr style="border-bottom:2px solid var(--gray-200)">
                                    <th style="text-align:start;padding:6px 4px;font-size:11px;color:var(--gray-500)">المنتج</th>
                                    <th style="text-align:center;padding:6px 4px;font-size:11px;color:var(--gray-500)">الكمية</th>
                                    <th style="text-align:end;padding:6px 4px;font-size:11px;color:var(--gray-500)">السعر</th>
                                    <th style="text-align:end;padding:6px 4px;font-size:11px;color:var(--gray-500)">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(c => `
                                    <tr>
                                        <td style="padding:8px 4px;font-weight:600">${c.productName}<br><span style="font-size:11px;color:var(--gray-400);font-weight:400">${c.color} / ${c.size}</span></td>
                                        <td style="text-align:center;padding:8px 4px">x${c.quantity}</td>
                                        <td style="text-align:end;padding:8px 4px">${c.sellingPrice} ج.م</td>
                                        <td style="text-align:end;padding:8px 4px;font-weight:700">${c.sellingPrice * c.quantity} ج.م</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div style="padding:16px 0">
                        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                            <span style="color:var(--gray-500)">الإجمالي:</span>
                            <span style="font-weight:600">${total} ج.م</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                            <span style="color:var(--gray-500)">الربح:</span>
                            <span style="font-weight:600;color:var(--success)">${profit} ج.م</span>
                        </div>
                    </div>

                    <div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius-sm)">
                        <div style="font-size:24px;font-weight:800;color:var(--primary)">${total} ج.م</div>
                        <div style="font-size:12px;color:var(--gray-400);margin-top:4px">المبلغ المدفوع</div>
                    </div>

                    <div style="text-align:center;margin-top:16px;font-size:12px;color:var(--gray-400)">
                        <i class="fas fa-check-circle" style="color:var(--success)"></i> تم البيع بنجاح - شكراً لك
                    </div>
                </div>
                <div class="modal-footer" style="justify-content:center;gap:12px">
                    <button class="btn btn-primary" onclick="app.closeModal()">
                        <i class="fas fa-check"></i> تم
                    </button>
                    <button class="btn btn-outline" onclick="window.print()">
                        <i class="fas fa-print"></i> طباعة الفاتورة
                    </button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }
};
