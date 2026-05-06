// ============================
// طبقة البيانات - المنتجات، الموردين، المخزون، المبيعات، المشتريات، السجلات
// ============================

const DataStore = {
    products: [],
    suppliers: [],
    inventory: [],
    sales: [],
    purchases: [],
    purchaseItems: [],
    logs: [],
    payments: [],
    settings: {},

    init() {
        this.load();
        if (this.products.length === 0) {
            this.seedDemoData();
        }
    },

    seedDemoData() {
        this.products = [
            { id: 1, name: "قميص عادي", category: "تيشيرتات", costPrice: 80, sellingPrice: 150 },
            { id: 2, name: "جينز دينيم", category: "جينز", costPrice: 200, sellingPrice: 400 },
            { id: 3, name: "هودي أوفرسايز", category: "هوديات", costPrice: 180, sellingPrice: 350 }
        ];

        this.inventory = [
            { id: 1, productId: 1, color: "أسود", size: "S", stock: 10 },
            { id: 2, productId: 1, color: "أسود", size: "M", stock: 15 },
            { id: 3, productId: 1, color: "أبيض", size: "S", stock: 8 },
            { id: 4, productId: 1, color: "أبيض", size: "M", stock: 5 },
            { id: 5, productId: 2, color: "أزرق", size: "30", stock: 5 },
            { id: 6, productId: 2, color: "أزرق", size: "32", stock: 7 },
            { id: 7, productId: 2, color: "أزرق", size: "34", stock: 4 },
            { id: 8, productId: 3, color: "أسود", size: "M", stock: 6 },
            { id: 9, productId: 3, color: "أسود", size: "L", stock: 10 },
            { id: 10, productId: 3, color: "رمادي", size: "M", stock: 4 },
            { id: 11, productId: 3, color: "رمادي", size: "L", stock: 8 }
        ];

        this.suppliers = [
            { id: 1, name: "شركة الجملة للأزياء", totalPurchases: 0, totalPaid: 0, remainingDebt: 0 }
        ];

        this.purchases = [
            { id: 1, supplierId: 1, date: new Date().toISOString(), totalCost: 2000, amountPaid: 1000, remainingDebt: 1000, userId: 'admin', invoiceNumber: 'INV-001' }
        ];

        this.purchaseItems = [
            { id: 1, purchaseId: 1, productId: 1, color: "أسود", size: "M", quantity: 10, costPrice: 80 },
            { id: 2, purchaseId: 1, productId: 2, color: "أزرق", size: "32", quantity: 5, costPrice: 200 }
        ];

        const supplier = this.suppliers.find(s => s.id === 1);
        if (supplier) {
            supplier.totalPurchases = 2000;
            supplier.totalPaid = 1000;
            supplier.remainingDebt = 1000;
        }

        this.sales = [
            { id: 1, date: new Date().toISOString(), items: [
                { productId: 1, color: "أسود", size: "S", quantity: 2, sellingPrice: 150, costPrice: 80 },
                { productId: 2, color: "أزرق", size: "32", quantity: 1, sellingPrice: 400, costPrice: 200 },
                { productId: 3, color: "أسود", size: "M", quantity: 1, sellingPrice: 350, costPrice: 180 }
            ], total: 1050, totalCost: 540, profit: 510, userId: 'admin' }
        ];

        this.adjustStock(1, "أسود", "S", -2);
        this.adjustStock(2, "أزرق", "32", -1);
        this.adjustStock(3, "أسود", "M", -1);
        this.adjustStock(1, "أسود", "M", 10);
        this.adjustStock(2, "أزرق", "32", 5);

        this.logs = [
            { id: 1, type: 'purchase', action: 'تم إنشاء فاتورة مشتريات', details: 'INV-001 - شركة الجملة للأزياء - 2,000 ج.م (مدفوع: 1,000 ج.م)', userId: 'admin', date: new Date().toISOString() },
            { id: 2, type: 'sale', action: 'تم إتمام عملية بيع', details: '3 منتجات - الإجمالي: 1,050 ج.م - الربح: 510 ج.م', userId: 'admin', date: new Date().toISOString() }
        ];

        this.save();
    },

    getStock(productId, color, size) {
        const item = this.inventory.find(i => i.productId === productId && i.color === color && i.size === size);
        return item ? item.stock : 0;
    },

    adjustStock(productId, color, size, delta) {
        let item = this.inventory.find(i => i.productId === productId && i.color === color && i.size === size);
        if (item) {
            item.stock += delta;
            if (item.stock < 0) item.stock = 0;
        } else if (delta > 0) {
            const maxId = this.inventory.length > 0 ? Math.max(...this.inventory.map(i => i.id)) : 0;
            this.inventory.push({ id: maxId + 1, productId, color, size, stock: delta });
        }
        this.save();
    },

    getLowStockItems(threshold = 5) {
        return this.inventory.filter(i => i.stock <= threshold && i.stock > 0);
    },

    getOutOfStockItems() {
        return this.inventory.filter(i => i.stock === 0);
    },

    getProductVariants(productId) {
        return this.inventory.filter(i => i.productId === productId);
    },

    getProductColors(productId) {
        return [...new Set(this.inventory.filter(i => i.productId === productId).map(i => i.color))];
    },

    getProductSizes(productId, color) {
        return [...new Set(this.inventory.filter(i => i.productId === productId && i.color === color).map(i => i.size))];
    },

    addSale(saleData) {
        const maxId = this.sales.length > 0 ? Math.max(...this.sales.map(s => s.id)) : 0;
        saleData.id = maxId + 1;
        saleData.date = new Date().toISOString();
        this.sales.push(saleData);
        this.save();
        return saleData;
    },

    getTotalSales() {
        return this.sales.reduce((sum, s) => sum + s.total, 0);
    },

    getTotalProfit() {
        return this.sales.reduce((sum, s) => sum + (s.profit || 0), 0);
    },

    addPurchase(purchaseData) {
        const maxId = this.purchases.length > 0 ? Math.max(...this.purchases.map(p => p.id)) : 0;
        purchaseData.id = maxId + 1;
        purchaseData.date = new Date().toISOString();
        this.purchases.push(purchaseData);
        this.save();
        return purchaseData;
    },

    addPurchaseItem(item) {
        const maxId = this.purchaseItems.length > 0 ? Math.max(...this.purchaseItems.map(i => i.id)) : 0;
        item.id = maxId + 1;
        this.purchaseItems.push(item);
        this.save();
    },

    addPayment(paymentData) {
        const maxId = this.payments.length > 0 ? Math.max(...this.payments.map(p => p.id)) : 0;
        paymentData.id = maxId + 1;
        paymentData.date = new Date().toISOString();
        this.payments.push(paymentData);
        this.save();
        return paymentData;
    },

    addLog(logData) {
        const maxId = this.logs.length > 0 ? Math.max(...this.logs.map(l => l.id)) : 0;
        logData.id = maxId + 1;
        logData.date = new Date().toISOString();
        this.logs.unshift(logData);
        this.save();
    },

    getSuppliers() { return this.suppliers; },
    getSupplier(id) { return this.suppliers.find(s => s.id === id); },

    updateSupplierDebt(supplierId) {
        const purchases = this.purchases.filter(p => p.supplierId === supplierId);
        const totalPurchases = purchases.reduce((sum, p) => sum + p.totalCost, 0);
        const totalPaid = purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        const payments = this.payments.filter(p => p.supplierId === supplierId);
        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

        const supplier = this.getSupplier(supplierId);
        if (supplier) {
            supplier.totalPurchases = totalPurchases;
            supplier.totalPaid = totalPaid + totalPayments;
            supplier.remainingDebt = totalPurchases - (totalPaid + totalPayments);
            if (supplier.remainingDebt < 0) supplier.remainingDebt = 0;
        }
        this.save();
    },

    save() {
        const data = {
            products: this.products,
            suppliers: this.suppliers,
            inventory: this.inventory,
            sales: this.sales,
            purchases: this.purchases,
            purchaseItems: this.purchaseItems,
            logs: this.logs,
            payments: this.payments
        };
        try {
            localStorage.setItem('clothesErpData', JSON.stringify(data));
        } catch(e) {
            console.warn('تعذر الحفظ:', e);
        }
    },

    load() {
        try {
            const raw = localStorage.getItem('clothesErpData');
            if (raw) {
                const data = JSON.parse(raw);
                this.products = data.products || [];
                this.suppliers = data.suppliers || [];
                this.inventory = data.inventory || [];
                this.sales = data.sales || [];
                this.purchases = data.purchases || [];
                this.purchaseItems = data.purchaseItems || [];
                this.logs = data.logs || [];
                this.payments = data.payments || [];
            }
        } catch(e) {
            console.warn('تعذر التحميل:', e);
        }
    },

    reset() {
        localStorage.removeItem('clothesErpData');
        this.products = [];
        this.suppliers = [];
        this.inventory = [];
        this.sales = [];
        this.purchases = [];
        this.purchaseItems = [];
        this.logs = [];
        this.payments = [];
        this.seedDemoData();
    },

    getTodaysSales() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.sales.filter(s => new Date(s.date) >= today).reduce((sum, s) => sum + s.total, 0);
    },

    getTotalStockItems() {
        return this.inventory.reduce((sum, i) => sum + i.stock, 0);
    },

    getTotalSupplierDebt() {
        return this.suppliers.reduce((sum, s) => sum + (s.remainingDebt || 0), 0);
    }
};
