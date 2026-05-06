import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  FiGrid, FiShoppingBag, FiPackage, FiDollarSign, FiTruck, FiCreditCard, 
  FiFileText, FiBarChart2, FiSettings, FiSun, FiMoon, FiLogOut,
  FiPlus, FiX, FiSearch, FiShoppingCart, FiCheck, FiAlertCircle,
  FiInfo, FiTrash2, FiChevronDown, FiChevronUp, FiUser, FiShield,
  FiMenu, FiTrendingUp, FiTrendingDown, FiBox, FiClipboard,
  FiCornerUpLeft, FiAward, FiHome
} from 'react-icons/fi';
import { FaTshirt } from 'react-icons/fa';
import { GiTrousers, GiHoodie } from 'react-icons/gi';

// ===== CONTEXTS =====
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// ===== CONSTANTS =====
const ProductIcon = ({ icon, size = '1.5rem' }) => {
  const icons = {
    '👕': <FaTshirt size={size} />,
    '👖': <GiTrousers size={size} />,
    '🧥': <GiHoodie size={size} />,
    'تيشيرت': <FaTshirt size={size} />,
    'بنطال': <GiTrousers size={size} />,
    'هودي': <GiHoodie size={size} />,
  };
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>{icons[icon] || icon}</span>;
};

const COLORS = {
  'أسود': '#1a1a2e',
  'أبيض': '#f0f0f0',
  'أزرق': '#3b82f6',
  'رمادي': '#9ca3af',
  'أحمر': '#ef4444',
  'أخضر': '#10b981',
};

const initialProducts = [
  { id: 1, name: 'تيشيرت أساسي', emoji: '👕', category: 'تيشيرتات', cost: 80, price: 150, variants: { 'أسود': { S: 10, M: 15, L: 0, XL: 0 }, 'أبيض': { S: 8, M: 5, L: 0, XL: 0 } } },
  { id: 2, name: 'جينز دينم', emoji: '👖', category: 'بناطيل', cost: 200, price: 400, variants: { 'أزرق': { '30': 5, '32': 7, '34': 4, '36': 0 } } },
  { id: 3, name: 'هودي أوفرسايز', emoji: '🧥', category: 'هوديز', cost: 180, price: 350, variants: { 'أسود': { M: 6, L: 10, XL: 0 }, 'رمادي': { M: 4, L: 8, XL: 0 } } },
];

const initialSuppliers = [{ id: 1, name: 'شركة الأزياء العالمية', phone: '0123456789' }];

const initialPurchases = [{
  id: 1, supplierId: 1, date: new Date().toISOString().split('T')[0],
  items: [{ productId: 1, color: 'أسود', size: 'S', qty: 10, price: 80 }, { productId: 1, color: 'أسود', size: 'M', qty: 5, price: 80 }, { productId: 2, color: 'أزرق', size: '32', qty: 5, price: 200 }],
  total: 2300, paid: 1150, remaining: 1150, status: 'partial',
}];

const initialSales = [{
  id: 1, date: new Date().toISOString().split('T')[0], time: '10:30 صباحاً',
  items: [{ productId: 1, name: 'تيشيرت أساسي', color: 'أسود', size: 'S', qty: 2, price: 150, cost: 80 }, { productId: 2, name: 'جينز دينم', color: 'أزرق', size: '32', qty: 1, price: 400, cost: 200 }, { productId: 3, name: 'هودي أوفرسايز', color: 'أسود', size: 'M', qty: 1, price: 350, cost: 180 }],
  total: 1050, profit: 410,
}];

const initialPayments = [{ id: 1, supplierId: 1, date: new Date().toISOString().split('T')[0], amount: 1150, note: 'دفعة أولى' }];

let nextIds = { product: 4, sale: 2, purchase: 2, payment: 2 };

const getToday = () => new Date().toISOString().split('T')[0];
const getTime = () => new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

// ===== APP PROVIDER =====
export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      return {
        products: JSON.parse(localStorage.getItem('erp_products')) || JSON.parse(JSON.stringify(initialProducts)),
        suppliers: JSON.parse(localStorage.getItem('erp_suppliers')) || JSON.parse(JSON.stringify(initialSuppliers)),
        purchases: JSON.parse(localStorage.getItem('erp_purchases')) || JSON.parse(JSON.stringify(initialPurchases)),
        sales: JSON.parse(localStorage.getItem('erp_sales')) || JSON.parse(JSON.stringify(initialSales)),
        payments: JSON.parse(localStorage.getItem('erp_payments')) || JSON.parse(JSON.stringify(initialPayments)),
        logs: {},
      };
    } catch {
      return { products: [...initialProducts], suppliers: [...initialSuppliers], purchases: [...initialPurchases], sales: [...initialSales], payments: [...initialPayments], logs: {} };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('erp_products', JSON.stringify(state.products));
      localStorage.setItem('erp_suppliers', JSON.stringify(state.suppliers));
      localStorage.setItem('erp_purchases', JSON.stringify(state.purchases));
      localStorage.setItem('erp_sales', JSON.stringify(state.sales));
      localStorage.setItem('erp_payments', JSON.stringify(state.payments));
    } catch {}
  }, [state]);

  const addLog = useCallback((type, data) => {
    setState(prev => {
      const today = getToday();
      const dayLogs = { ...(prev.logs[today] || { inventory: [], sales: [], purchases: [] }) };
      dayLogs[type].push({ ...data, time: getTime(), timestamp: Date.now() });
      return { ...prev, logs: { ...prev.logs, [today]: dayLogs } };
    });
  }, []);

  const addProduct = useCallback((product) => {
    const newProduct = { ...product, id: nextIds.product++ };
    setState(prev => ({ ...prev, products: [...prev.products, newProduct] }));
    addLog('inventory', { type: 'إضافة منتج جديد', items: product.name, details: 'تم إضافة منتج جديد' });
    return newProduct;
  }, [addLog]);

  const makeSale = useCallback((items) => {
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const profit = items.reduce((s, i) => s + (i.price - i.cost) * i.qty, 0);
    const sale = { id: nextIds.sale++, date: getToday(), time: getTime(), items, total, profit };

    setState(prev => ({
      ...prev,
      products: prev.products.map(p => {
        const saleItem = items.find(i => i.productId === p.id);
        if (!saleItem) return p;
        const newVariants = { ...p.variants };
        if (newVariants[saleItem.color]) {
          const sizes = { ...newVariants[saleItem.color] };
          sizes[saleItem.size] = Math.max(0, (sizes[saleItem.size] || 0) - saleItem.qty);
          newVariants[saleItem.color] = sizes;
        }
        return { ...p, variants: newVariants };
      }),
      sales: [...prev.sales, sale],
    }));
    addLog('sales', { saleId: sale.id, items, total, profit });
    addLog('inventory', { type: 'بيع', items: items.map(i => `${i.name} (${i.color}/${i.size}) x${i.qty}`).join(', '), details: `إجمالي: ${total} ج.م` });
    return sale;
  }, [addLog]);

  const addPurchase = useCallback((purchaseData) => {
    const purchase = { id: nextIds.purchase++, date: getToday(), ...purchaseData };
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => {
        const pItem = purchaseData.items.find(i => i.productId === p.id);
        if (!pItem) return p;
        const newVariants = { ...p.variants };
        if (!newVariants[pItem.color]) newVariants[pItem.color] = {};
        const sizes = { ...newVariants[pItem.color] };
        sizes[pItem.size] = (sizes[pItem.size] || 0) + pItem.qty;
        newVariants[pItem.color] = sizes;
        return { ...p, variants: newVariants };
      }),
      purchases: [...prev.purchases, purchase],
    }));
    addLog('purchases', { purchaseId: purchase.id, items: purchaseData.items, total: purchaseData.total, supplierId: purchaseData.supplierId });
    addLog('inventory', { type: 'فاتورة شراء', items: purchaseData.items.map(i => `${i.name} (${i.color}/${i.size}) x${i.qty}`).join(', '), details: `الإجمالي: ${purchaseData.total} ج.م` });
    return purchase;
  }, [addLog]);

  const addPayment = useCallback((payment) => {
    const newPayment = { ...payment, id: nextIds.payment++ };
    setState(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
    return newPayment;
  }, []);

  const resetDemo = useCallback(() => {
    nextIds = { product: 4, sale: 2, purchase: 2, payment: 2 };
    setState({ products: JSON.parse(JSON.stringify(initialProducts)), suppliers: JSON.parse(JSON.stringify(initialSuppliers)), purchases: JSON.parse(JSON.stringify(initialPurchases)), sales: JSON.parse(JSON.stringify(initialSales)), payments: JSON.parse(JSON.stringify(initialPayments)), logs: {} });
    localStorage.clear();
  }, []);

  const { products, suppliers, purchases, sales, payments, logs } = state;
  const todaySales = sales.filter(s => s.date === getToday());
  const dailyRevenue = todaySales.reduce((s, sale) => s + sale.total, 0);
  const dailyProfit = todaySales.reduce((s, sale) => s + sale.profit, 0);
  const totalStock = products.reduce((sum, p) => sum + Object.values(p.variants).reduce((s, sizes) => s + Object.values(sizes).reduce((ss, v) => ss + v, 0), 0), 0);

  const lowStockItems = [];
  products.forEach(p => Object.entries(p.variants).forEach(([color, sizes]) => Object.entries(sizes).forEach(([size, qty]) => { if (qty > 0 && qty <= 3) lowStockItems.push({ product: p.name, color, size, qty }); })));
  const totalDebt = purchases.reduce((sum, p) => sum + p.remaining, 0);

  return (
    <AppContext.Provider value={{
      products, suppliers, purchases, sales, payments, logs,
      addProduct, makeSale, addPurchase, addPayment, resetDemo,
      todaySales, dailyRevenue, dailyProfit, totalStock, lowStockItems, totalDebt,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ===== COMPONENTS =====

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: <FiCheck />, error: <FiAlertCircle />, info: <FiInfo /> };
  return (
    <div className={`toast ${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-msg">{message}</span>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  );
}

function StatCard({ icon, label, value, className, trend, trendUp, children }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card-header">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className="stat-card-label">{label}</div>
      {trend !== undefined && (
        <div className={`stat-card-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
          {trendUp ? <FiTrendingUp /> : <FiTrendingDown />} {trend}%
        </div>
      )}
      {children}
    </div>
  );
}

// ===== LOGIN PAGE =====
function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon"><FiShoppingBag size={32} /></div>
          <h1>نظام إدارة متجر الملابس</h1>
          <p>ERP Clothes Shop Management System</p>
        </div>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
          اختر صلاحية الدخول
        </p>
        <button className="login-btn" onClick={() => onLogin('admin')}>
          <FiShield className="btn-icon" />
          <span className="btn-label">مدير النظام</span>
          <span className="btn-badge admin">Admin</span>
        </button>
        <button className="login-btn" onClick={() => onLogin('cashier')}>
          <FiUser className="btn-icon" />
          <span className="btn-label">الكاشير</span>
          <span className="btn-badge cashier">Cashier</span>
        </button>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          نظام ERP متكامل لإدارة متاجر الملابس
        </p>
      </div>
    </div>
  );
}

// ===== DASHBOARD =====
function DashboardPage() {
  const { dailyRevenue, dailyProfit, totalStock, totalDebt, lowStockItems, todaySales, products, sales } = useApp();
  return (
    <div>
      <h2 className="page-title">
        <span className="page-title-icon"><FiHome /></span>
        لوحة التحكم
      </h2>
      <div className="stats-grid">
        <StatCard icon={<FiShoppingBag />} label="مبيعات اليوم" value={todaySales.length} className="sales" trend={15} trendUp />
        <StatCard icon={<FiDollarSign />} label="إجمالي الإيراد" value={`${dailyRevenue.toLocaleString()} ج.م`} className="revenue" trend={22} trendUp />
        <StatCard icon={<FiTrendingUp />} label="صافي الربح" value={<span className="profit-positive">+{dailyProfit.toLocaleString()} ج.م</span>} className="profit" trend={8} trendUp />
        <StatCard icon={<FiPackage />} label="إجمالي المخزون" value={totalStock} className="inventory" />
        <StatCard icon={<FiAlertCircle />} label="تنبيهات نقص المخزون" value={lowStockItems.length > 0 ? lowStockItems.length : <span style={{color:'var(--success)'}}>لا يوجد</span>} className="alert" />
        <StatCard icon={<FiCreditCard />} label="إجمالي المديونيات" value={`${totalDebt.toLocaleString()} ج.م`} className="debt" />
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title"><FiBox /> المنتجات</h3></div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {products.map(p => (
              <span key={p.id} className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ProductIcon icon={p.emoji} size="1.2rem" /> {p.name}
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title"><FiShoppingBag /> آخر المبيعات</h3></div>
          {sales.slice(-3).reverse().map(s => (
            <div key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.items.map(i => `${i.name} x${i.qty}`).join(' + ')}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {s.date} - {s.total.toLocaleString()} ج.م | ربح <span className="profit-positive">+{s.profit.toLocaleString()} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== PRODUCTS =====
function ProductsPage() {
  const { products, addProduct } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const filtered = products.filter(p => p.name.includes(search));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>
          <span className="page-title-icon"><FiShoppingBag /></span>
          المنتجات
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> إضافة منتج</button>
      </div>
      <div className="search-box">
        <span className="search-icon"><FiSearch /></span>
        <input placeholder="بحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="grid-3">
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <ProductIcon icon={p.emoji} size="2rem" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.name}</div>
                <span className="badge badge-info">{p.category}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', marginBottom: '6px' }}>
              <span>التكلفة: <strong>{p.cost} ج.م</strong></span>
              <span>البيع: <strong className="profit-positive">{p.price} ج.م</strong></span>
              <span>الربح: <strong className="profit-positive">+{p.price - p.cost} ج.م</strong></span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {expanded === p.id ? <FiChevronUp /> : <FiChevronDown />} {expanded === p.id ? 'إخفاء' : 'عرض'} المتغيرات
            </div>
            {expanded === p.id && (
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                {Object.entries(p.variants).map(([color, sizes]) => (
                  <div key={color} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span className="color-swatch" style={{ background: COLORS[color] || '#000' }}></span>
                      {color}
                    </div>
                    <div className="variant-grid">
                      {Object.entries(sizes).map(([size, qty]) => (
                        <div key={size} className={`variant-cell ${qty === 0 ? 'out-of-stock' : qty <= 3 ? 'low-stock' : 'in-stock'}`}>
                          <div className="variant-size">{size}</div>
                          <div className="variant-qty">{qty}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {showModal && <AddProductModal onClose={() => setShowModal(false)} onAdd={addProduct} />}
    </div>
  );
}

function AddProductModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: '', emoji: '👕', category: 'تيشيرتات', cost: '', price: '' });
  const [step, setStep] = useState(1);
  const [colorsInput, setColorsInput] = useState('أسود، أبيض');
  const [sizesInput, setSizesInput] = useState('S، M');
  const [quantities, setQuantities] = useState({});

  const colors = colorsInput.split(/[،,]/).map(s => s.trim()).filter(Boolean);
  const sizes = sizesInput.split(/[،,]/).map(s => s.trim()).filter(Boolean);

  const handleStep1 = () => {
    if (!formData.name || !formData.cost || !formData.price) return alert('يرجى ملء جميع الحقول المطلوبة');
    setStep(2);
    const qs = {};
    colors.forEach(c => sizes.forEach(s => { qs[`${c}|${s}`] = 0; }));
    setQuantities(qs);
  };

  const setQty = (color, size, val) => {
    setQuantities(prev => ({ ...prev, [`${color}|${size}`]: Math.max(0, parseInt(val) || 0) }));
  };

  const handleSubmit = () => {
    if (!colors.length || !sizes.length) return alert('يرجى إدخال الألوان والمقاسات');
    const variants = {};
    colors.forEach(c => {
      variants[c] = {};
      sizes.forEach(s => {
        variants[c][s] = quantities[`${c}|${s}`] || 0;
      });
    });
    onAdd({ ...formData, cost: parseInt(formData.cost), price: parseInt(formData.price), variants });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title"><FiPlus /> إضافة منتج جديد</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">رمز المنتج</label>
              <input className="form-input" value={formData.emoji} onChange={e => setFormData(p => ({ ...p, emoji: e.target.value }))} placeholder="👕" />
            </div>
            <div className="form-group">
              <label className="form-label">اسم المنتج *</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="مثال: تيشيرت أساسي" />
            </div>
            <div className="form-group">
              <label className="form-label">التصنيف</label>
              <select className="form-select" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                <option>تيشيرتات</option>
                <option>بناطيل</option>
                <option>هوديز</option>
                <option>جواكت</option>
                <option>إكسسوارات</option>
              </select>
            </div>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">سعر التكلفة *</label>
                <input className="form-input" type="number" value={formData.cost} onChange={e => setFormData(p => ({ ...p, cost: e.target.value }))} placeholder="80" />
              </div>
              <div className="form-group">
                <label className="form-label">سعر البيع *</label>
                <input className="form-input" type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} placeholder="150" />
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleStep1}>التالي <FiChevronDown /></button>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">الألوان (افصل بينها بفواصل)</label>
              <input className="form-input" value={colorsInput} onChange={e => setColorsInput(e.target.value)} placeholder="أسود، أبيض، أزرق" />
            </div>
            <div className="form-group">
              <label className="form-label">المقاسات (افصل بينها بفواصل)</label>
              <input className="form-input" value={sizesInput} onChange={e => setSizesInput(e.target.value)} placeholder="S، M، L، XL" />
            </div>
            {colors.length > 0 && sizes.length > 0 && (
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '10px', fontSize: '0.85rem' }}>الكميات:</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: '300px' }}>
                    <thead>
                      <tr>
                        <th>اللون \ المقاس</th>
                        {sizes.map(s => <th key={s} style={{ textAlign: 'center' }}>{s}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map(c => (
                        <tr key={c}>
                          <td style={{ fontWeight: 700 }}><span className="color-swatch" style={{ background: COLORS[c] || '#000', display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}></span> {c}</td>
                          {sizes.map(s => (
                            <td key={s} style={{ padding: '4px' }}>
                              <input className="form-input" type="number" min="0" value={quantities[`${c}|${s}`] || 0}
                                onChange={e => setQty(c, s, e.target.value)}
                                style={{ width: '60px', textAlign: 'center', padding: '6px' }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}><FiCornerUpLeft /> رجوع</button>
              <button className="btn btn-primary btn-block" onClick={handleSubmit}><FiCheck /> حفظ المنتج</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== SALES (POS) =====
function SalesPage() {
  const { products, makeSale } = useApp();
  const [cart, setCart] = useState([]);
  const [selProd, setSelProd] = useState(null);
  const [selColor, setSelColor] = useState(null);
  const [selSize, setSelSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(null);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = () => {
    if (!selProd || !selColor || !selSize || qty < 1) return setToast({ msg: 'يرجى اختيار المنتج واللون والمقاس والكمية', type: 'error' });
    const stock = selProd.variants[selColor]?.[selSize] || 0;
    if (qty > stock) return setToast({ msg: `الكمية المتاحة: ${stock} فقط`, type: 'error' });
    const idx = cart.findIndex(i => i.productId === selProd.id && i.color === selColor && i.size === selSize);
    if (idx >= 0) {
      const nc = [...cart];
      const nq = nc[idx].qty + qty;
      if (nq > stock) return setToast({ msg: `الكمية المتاحة: ${stock} فقط`, type: 'error' });
      nc[idx].qty = nq;
      setCart(nc);
    } else {
      setCart([...cart, { productId: selProd.id, name: selProd.name, emoji: selProd.emoji, color: selColor, size: selSize, qty, price: selProd.price, cost: selProd.cost }]);
    }
    setToast({ msg: `تمت إضافة ${qty} ${selProd.name} (${selColor}/${selSize})`, type: 'success' });
    setQty(1);
  };

  const completeSale = () => {
    if (!cart.length) return setToast({ msg: 'السلة فارغة', type: 'error' });
    makeSale(cart);
    setToast({ msg: `✅ تمت عملية البيع بنجاح! الإجمالي: ${cartTotal.toLocaleString()} ج.م`, type: 'success' });
    setCart([]); setSelProd(null); setSelColor(null); setSelSize(null);
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="page-title">
        <span className="page-title-icon"><FiShoppingCart /></span>
        نقطة البيع
      </h2>
      <div className="pos-grid">
        <div>
          <div style={{ marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}><FiGrid /> اختيار المنتج</div>
          <div className="pos-products-grid">
            {products.map(p => (
              <div key={p.id} className={`pos-product-card ${selProd?.id === p.id ? 'selected' : ''}`}
                onClick={() => { setSelProd(p); setSelColor(null); setSelSize(null); }}>
                <div className="product-icon"><ProductIcon icon={p.emoji} size="1.5rem" /></div>
                <div className="product-name">{p.name}</div>
                <div className="product-price">{p.price.toLocaleString()} ج.م</div>
              </div>
            ))}
          </div>
          {selProd && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProductIcon icon={selProd.emoji} size="1.5rem" /> {selProd.name}
              </div>
              <div className="form-group">
                <label className="form-label">اللون</label>
                <div className="size-btns">
                  {Object.keys(selProd.variants).map(color => (
                    <button key={color} className={`size-btn ${selColor === color ? 'selected' : ''}`}
                      onClick={() => { setSelColor(color); setSelSize(null); }}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              {selColor && (
                <div className="form-group">
                  <label className="form-label">المقاس</label>
                  <div className="size-btns">
                    {Object.entries(selProd.variants[selColor]).map(([size, q]) => (
                      <button key={size} className={`size-btn ${selSize === size ? 'selected' : ''} ${q === 0 ? 'out-of-stock' : ''}`}
                        onClick={() => q > 0 && setSelSize(size)}>
                        {size} {q > 0 ? `(${q})` : '—'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selSize && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">الكمية</label>
                    <input className="form-input" type="number" min="1" max={selProd.variants[selColor][selSize]} value={qty}
                      onChange={e => setQty(Math.min(parseInt(e.target.value) || 1, selProd.variants[selColor][selSize]))} />
                  </div>
                  <button className="btn btn-success" style={{ height: '44px' }} onClick={addToCart}><FiPlus /> إضافة</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <div className="pos-cart">
            <div className="pos-cart-header"><FiShoppingCart /> سلة المشتريات</div>
            <div className="pos-cart-body">
              {!cart.length ? (
                <EmptyState icon={<FiShoppingBag />} text="السلة فارغة" />
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="pos-cart-item">
                    <div className="pos-cart-item-icon"><ProductIcon icon={item.emoji} size="1rem" /></div>
                    <div className="pos-cart-item-info">
                      <div className="pos-cart-item-name">{item.name}</div>
                      <div className="pos-cart-item-variant">{item.color} / {item.size} × {item.qty}</div>
                    </div>
                    <div className="pos-cart-item-price">{(item.price * item.qty).toLocaleString()} ج.م</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCart(cart.filter((_, idx) => idx !== i))}><FiTrash2 color="var(--danger)" /></button>
                  </div>
                ))
              )}
            </div>
            <div className="pos-cart-footer">
              <div className="pos-cart-total">
                <span>الإجمالي</span>
                <span>{cartTotal.toLocaleString()} ج.م</span>
              </div>
              <button className="btn btn-success btn-block btn-lg" onClick={completeSale} disabled={!cart.length}>
                <FiCheck /> تأكيد البيع
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== INVENTORY =====
function InventoryPage() {
  const { products } = useApp();
  const [search, setSearch] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const allColors = [...new Set(products.flatMap(p => Object.keys(p.variants)))];
  const allSizes = [...new Set(products.flatMap(p => Object.values(p.variants).flatMap(v => Object.keys(v))))];

  const filtered = products.filter(p => {
    if (search && !p.name.includes(search)) return false;
    if (filterColor && !Object.keys(p.variants).some(c => c.includes(filterColor))) return false;
    if (filterSize && !Object.values(p.variants).some(v => Object.keys(v).some(s => s === filterSize))) return false;
    return true;
  });

  return (
    <div>
      <h2 className="page-title"><span className="page-title-icon"><FiPackage /></span> المخزون</h2>
      <div className="filter-row">
        <div className="search-box" style={{ flex: 1, margin: 0 }}>
          <span className="search-icon"><FiSearch /></span>
          <input placeholder="بحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={filterColor} onChange={e => setFilterColor(e.target.value)}>
          <option value="">كل الألوان</option>
          {allColors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" value={filterSize} onChange={e => setFilterSize(e.target.value)}>
          <option value="">كل المقاسات</option>
          {allSizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid-3">
        {filtered.map(p => (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ProductIcon icon={p.emoji} size="1.5rem" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.name}</div>
                <span className="badge badge-info">{p.category}</span>
              </div>
            </div>
            {Object.entries(p.variants).map(([color, sizes]) => (
              <div key={color} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>
                  <span className="color-swatch" style={{ background: COLORS[color] || '#000' }}></span>
                  {color} <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500 }}>({Object.values(sizes).reduce((a, b) => a + b, 0)} قطعة)</span>
                </div>
                <div className="variant-grid">
                  {Object.entries(sizes).map(([size, qty]) => (
                    <div key={size} className={`variant-cell ${qty === 0 ? 'out-of-stock' : qty <= 3 ? 'low-stock' : 'in-stock'}`}>
                      <div className="variant-size">{size}</div>
                      <div className="variant-qty">{qty}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== PURCHASES =====
function PurchasesPage() {
  const { products, suppliers, purchases, addPurchase } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}><span className="page-title-icon"><FiTruck /></span> فواتير الشراء</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> فاتورة جديدة</button>
      </div>
      {!purchases.length ? (
        <EmptyState icon={<FiClipboard />} text="لا توجد فواتير شراء" />
      ) : (
        <div className="grid-3">
          {purchases.map(p => {
            const supplier = suppliers.find(s => s.id === p.supplierId);
            return (
              <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>فاتورة #{p.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.date}</div>
                  </div>
                  <span className={`badge ${p.remaining > 0 ? 'badge-warning' : 'badge-success'}`}>
                    {p.remaining > 0 ? 'غير مدفوعة' : 'مدفوعة'}
                  </span>
                </div>
                <div style={{ marginBottom: '8px' }}><span className="badge badge-primary">{supplier?.name}</span></div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                  <span>الإجمالي: <strong>{p.total.toLocaleString()} ج.م</strong></span>
                  <span>المدفوع: <strong className="profit-positive">{p.paid.toLocaleString()} ج.م</strong></span>
                  {p.remaining > 0 && <span>المتبقي: <strong style={{ color: 'var(--danger)' }}>{p.remaining.toLocaleString()} ج.م</strong></span>}
                </div>
                {expanded === p.id && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                    {p.items.map((item, i) => {
                      const prod = products.find(pr => pr.id === item.productId);
                      return (
                        <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {prod && <ProductIcon icon={prod.emoji} size="1rem" />} {item.name || prod?.name} - {item.color} / {item.size} × {item.qty} = {(item.price * item.qty).toLocaleString()} ج.م
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {showModal && <AddPurchaseModal products={products} suppliers={suppliers} onClose={() => setShowModal(false)} onAdd={(data) => { addPurchase(data); setToast({ msg: '✅ تمت إضافة فاتورة الشراء بنجاح', type: 'success' }); setShowModal(false); }} />}
    </div>
  );
}

function AddPurchaseModal({ products, suppliers, onClose, onAdd }) {
  const [items, setItems] = useState([{ productId: '', color: '', size: '', qty: '', price: '' }]);
  const [paid, setPaid] = useState('');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');

  const updateItem = (i, field, val) => {
    const ni = [...items];
    ni[i][field] = val;
    if (field === 'productId') {
      const prod = products.find(p => p.id === parseInt(val));
      if (prod) { ni[i].price = prod.cost; ni[i].color = Object.keys(prod.variants)[0] || ''; ni[i].size = Object.keys(prod.variants[ni[i].color] || {})[0] || ''; }
    }
    setItems(ni);
  };

  const total = items.reduce((s, item) => s + (parseInt(item.price) || 0) * (parseInt(item.qty) || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title"><FiTruck /> فاتورة شراء جديدة</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="form-group">
          <label className="form-label">المورد</label>
          <select className="form-select" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <label className="form-label">المنتجات المشتراة</label>
        {items.map((item, i) => (
          <div key={i} style={{ padding: '8px', marginBottom: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.82rem' }}>منتج #{i + 1}</strong>
              {items.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => setItems(items.filter((_, idx) => idx !== i))}><FiTrash2 /></button>}
            </div>
            <div className="filter-row" style={{ margin: 0 }}>
              <select className="form-select" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                <option value="">اختر منتج</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {item.productId && products.find(p => p.id === parseInt(item.productId)) && (() => {
                const prod = products.find(p => p.id === parseInt(item.productId));
                return <>
                  <select className="form-select" value={item.color} onChange={e => { updateItem(i, 'color', e.target.value); updateItem(i, 'size', Object.keys(prod.variants[e.target.value] || {})[0] || ''); }}>
                    {Object.keys(prod.variants).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="form-select" value={item.size} onChange={e => updateItem(i, 'size', e.target.value)}>
                    {Object.keys(prod.variants[item.color] || {}).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </>;
              })()}
              <input className="form-input" type="number" placeholder="الكمية" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} style={{ maxWidth: '70px' }} />
              <input className="form-input" type="number" placeholder="السعر" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} style={{ maxWidth: '90px' }} />
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => setItems([...items, { productId: '', color: '', size: '', qty: '', price: '' }])} style={{ marginBottom: '1rem' }}><FiPlus /> إضافة منتج</button>
        <div className="form-group">
          <label className="form-label">المبلغ المدفوع</label>
          <input className="form-input" type="number" value={paid} onChange={e => setPaid(e.target.value)} placeholder="المبلغ المدفوع..." />
        </div>
        <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
          <span>الإجمالي</span>
          <span>{total.toLocaleString()} ج.م</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => {
          if (!supplierId) return;
          const pItems = items.map(item => {
            const prod = products.find(p => p.id === parseInt(item.productId));
            return { productId: parseInt(item.productId), name: prod?.name, color: item.color, size: item.size, qty: parseInt(item.qty), price: parseInt(item.price) };
          });
          const pa = parseInt(paid) || 0;
          onAdd({ supplierId: parseInt(supplierId), items: pItems, total, paid: pa, remaining: total - pa, status: pa >= total ? 'paid' : 'partial' });
        }}><FiCheck /> تأكيد الفاتورة</button>
      </div>
    </div>
  );
}

// ===== DEBTS =====
function DebtsPage() {
  const { suppliers, purchases, payments, addPayment } = useApp();
  const [showPay, setShowPay] = useState(null);
  const [toast, setToast] = useState(null);

  const supDebts = suppliers.map(s => {
    const sp = purchases.filter(p => p.supplierId === s.id);
    const tp = sp.reduce((sum, p) => sum + p.total, 0);
    const tpaid = sp.reduce((sum, p) => sum + p.paid, 0);
    return { ...s, totalPurchases: tp, totalPaid: tpaid, remaining: tp - tpaid, supPayments: payments.filter(p => p.supplierId === s.id) };
  }).filter(s => s.remaining > 0);

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="page-title"><span className="page-title-icon"><FiCreditCard /></span> المديونيات</h2>
      <div className="stats-grid">
        <StatCard icon={<FiCreditCard />} label="إجمالي المديونيات" value={`${supDebts.reduce((s, d) => s + d.remaining, 0).toLocaleString()} ج.م`} className="debt" />
        <StatCard icon={<FiUser />} label="الموردين" value={suppliers.length} className="sales" />
      </div>
      {!supDebts.length ? (
        <EmptyState icon={<FiCheck />} text="لا توجد مديونيات" />
      ) : (
        supDebts.map(sup => (
          <div key={sup.id} className="debt-card">
            <div className="debt-card-header">
              <span className="supplier-name"><FiUser /> {sup.name}</span>
              <span className="debt-amount">{sup.remaining.toLocaleString()} ج.م</span>
            </div>
            <div className="debt-card-body">
              <div className="debt-row"><span className="debt-label">إجمالي المشتريات</span><span className="debt-value">{sup.totalPurchases.toLocaleString()} ج.م</span></div>
              <div className="debt-row"><span className="debt-label">المدفوع</span><span className="debt-value profit-positive">{sup.totalPaid.toLocaleString()} ج.م</span></div>
              <div className="debt-row"><span className="debt-label">المتبقي</span><span className="debt-value" style={{ color: 'var(--danger)' }}>{sup.remaining.toLocaleString()} ج.م</span></div>
              {sup.supPayments.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}><FiFileText /> سجل المدفوعات</div>
                  {sup.supPayments.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.78rem' }}>
                      <span>{p.date}</span>
                      <span className="profit-positive">{p.amount.toLocaleString()} ج.م</span>
                      <span style={{ color: 'var(--text-muted)' }}>{p.note}</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn btn-primary btn-block" style={{ marginTop: '12px' }} onClick={() => setShowPay(sup.id)}><FiDollarSign /> تسديد دفعة</button>
            </div>
          </div>
        ))
      )}
      {showPay && (
        <div className="modal-overlay" onClick={() => setShowPay(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><FiDollarSign /> تسديد دفعة</h3>
              <button className="modal-close" onClick={() => setShowPay(null)}><FiX /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const amount = parseInt(fd.get('amount'));
              const note = fd.get('note');
              if (amount > 0) { addPayment({ supplierId: showPay, date: getToday(), amount, note }); setToast({ msg: '✅ تم تسجيل الدفعة بنجاح', type: 'success' }); setShowPay(null); }
            }}>
              <div className="form-group">
                <label className="form-label">المبلغ</label>
                <input className="form-input" type="number" name="amount" required placeholder="المبلغ..." />
              </div>
              <div className="form-group">
                <label className="form-label">ملاحظة</label>
                <input className="form-input" name="note" placeholder="ملاحظة (اختياري)" />
              </div>
              <button className="btn btn-primary btn-block"><FiCheck /> تأكيد الدفعة</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== LOGS =====
function LogsPage() {
  const { logs, sales, purchases } = useApp();
  const [selDate, setSelDate] = useState(getToday());
  const [tab, setTab] = useState('all');

  const dailySales = sales.filter(s => s.date === selDate);
  const dailyPurchases = purchases.filter(p => p.date === selDate);
  const dailyLogs = logs[selDate];

  const items = [];
  if (tab === 'all' || tab === 'sales') dailySales.forEach(s => items.push({ type: 'sale', data: s, time: s.time, title: `بيع #${s.id}`, desc: `${s.items.map(i => `${i.name} x${i.qty}`).join(' + ')}` }));
  if (tab === 'all' || tab === 'purchases') dailyPurchases.forEach(p => items.push({ type: 'purchase', data: p, time: '', title: `فاتورة شراء #${p.id}`, desc: `${p.items.map(i => i.name).join(' + ')} - ${p.total.toLocaleString()} ج.م` }));
  if (tab === 'all' || tab === 'inventory') dailyLogs?.inventory?.forEach(l => items.push({ type: 'inventory', data: l, time: l.time, title: l.type, desc: l.items || l.details }));
  items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div>
      <h2 className="page-title"><span className="page-title-icon"><FiFileText /></span> السجلات اليومية</h2>
      <div className="form-group">
        <label className="form-label">اختر التاريخ</label>
        <input className="form-input" type="date" value={selDate} onChange={e => setSelDate(e.target.value)} />
      </div>
      <div className="tabs">
        {[{ id: 'all', label: '📋 الكل' }, { id: 'sales', label: '🛒 المبيعات' }, { id: 'inventory', label: '📦 المخزون' }, { id: 'purchases', label: '🚚 المشتريات' }].map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--success)' }}>{dailySales.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>مبيعات</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--warning)' }}>{dailyPurchases.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>فواتير</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--info)' }}>{dailyLogs?.inventory?.length || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>حركة مخزون</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>{dailySales.reduce((s, sale) => s + sale.total, 0).toLocaleString()} ج.م</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>إيراد اليوم</div>
          </div>
        </div>
      </div>
      <div className="timeline">
        {!items.length ? (
          <EmptyState icon={<FiFileText />} text="لا توجد سجلات لهذا اليوم" />
        ) : (
          items.map((item, i) => (
            <div key={i} className={`timeline-item ${item.type}`}>
              <div className="timeline-time">{item.time || 'غير محدد'}</div>
              <div className="timeline-title">{item.title}</div>
              <div className="timeline-desc">{item.desc}</div>
              {item.type === 'sale' && (
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                  <span className="badge badge-success"><FiTrendingUp /> ربح: +{item.data.profit.toLocaleString()} ج.م</span>
                  <span className="badge badge-primary">{item.data.total.toLocaleString()} ج.م</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ===== PROFIT =====
function ProfitPage() {
  const { sales, dailyRevenue, dailyProfit } = useApp();
  const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0);
  const totalProfit = sales.reduce((s, sale) => s + sale.profit, 0);
  const totalCost = totalRevenue - totalProfit;

  const profitPerProduct = {};
  sales.forEach(sale => sale.items.forEach(item => {
    if (!profitPerProduct[item.name]) profitPerProduct[item.name] = { name: item.name, revenue: 0, cost: 0, profit: 0, qty: 0 };
    profitPerProduct[item.name].revenue += item.price * item.qty;
    profitPerProduct[item.name].cost += item.cost * item.qty;
    profitPerProduct[item.name].profit += (item.price - item.cost) * item.qty;
    profitPerProduct[item.name].qty += item.qty;
  }));

  return (
    <div>
      <h2 className="page-title"><span className="page-title-icon"><FiBarChart2 /></span> الأرباح</h2>
      <div className="stats-grid">
        <StatCard icon={<FiDollarSign />} label="إجمالي الإيراد" value={`${totalRevenue.toLocaleString()} ج.م`} className="revenue" />
        <StatCard icon={<FiTrendingDown />} label="إجمالي التكلفة" value={<span style={{color:'var(--danger)'}}>{totalCost.toLocaleString()} ج.م</span>} className="debt" />
        <StatCard icon={<FiAward />} label="صافي الربح" value={<span className="profit-positive">+{totalProfit.toLocaleString()} ج.م</span>} className="profit" />
        <StatCard icon={<FiBarChart2 />} label="نسبة الربح" value={<span style={{color:'var(--purple)'}}>{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</span>} className="profit" />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="card-title" style={{ marginBottom: '0.75rem' }}><FiBarChart2 /> الربح لكل منتج</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>المنتج</th><th>الكمية</th><th>الإيراد</th><th>التكلفة</th><th>الربح</th><th>%</th></tr>
            </thead>
            <tbody>
              {!Object.values(profitPerProduct).length ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد مبيعات بعد</td></tr>
              ) : (
                Object.values(profitPerProduct).map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.revenue.toLocaleString()} ج.م</td>
                    <td style={{ color: 'var(--danger)' }}>{item.cost.toLocaleString()} ج.م</td>
                    <td className="profit-positive" style={{ fontWeight: 800 }}>+{item.profit.toLocaleString()} ج.م</td>
                    <td><span className={`badge ${item.revenue > 0 ? 'badge-success' : 'badge-warning'}`}>{item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : 0}%</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid-3">
        <div className="profit-stat"><div className="stat-label">مبيعات اليوم</div><div className="stat-amount profit-positive">{dailyRevenue.toLocaleString()} ج.م</div></div>
        <div className="profit-stat"><div className="stat-label">ربح اليوم</div><div className="stat-amount profit-positive">+{dailyProfit.toLocaleString()} ج.م</div></div>
        <div className="profit-stat"><div className="stat-label">إجمالي المبيعات</div><div className="stat-amount">{sales.length}</div></div>
      </div>
    </div>
  );
}

// ===== SETTINGS =====
function SettingsPage({ onLogout, resetDemo }) {
  const [showReset, setShowReset] = useState(false);
  const [toast, setToast] = useState(null);

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="page-title"><span className="page-title-icon"><FiSettings /></span> الإعدادات</h2>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-title" style={{ marginBottom: '0.75rem' }}><FiTrash2 /> إعادة تعيين البيانات</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.82rem' }}>سيتم حذف جميع البيانات وإعادة تحميل بيانات العرض التوضيحي الافتراضية.</p>
        <button className="btn btn-danger" onClick={() => setShowReset(true)}><FiTrash2 /> إعادة تعيين بيانات الديمو</button>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-title" style={{ marginBottom: '0.75rem' }}><FiInfo /> حول النظام</div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 2, fontSize: '0.82rem' }}>
          <p><strong>نظام إدارة متجر الملابس</strong> - ERP Clothes Shop Management System</p>
          <p>الإصدار: 2.0.0</p>
          <p>نظام متكامل لإدارة مخزون الملابس مع متغيرات الألوان والمقاسات</p>
          <p>المميزات: إدارة المخزون، POS، فواتير المشتريات، تتبع المديونيات، السجلات اليومية، تحليل الأرباح</p>
        </div>
      </div>
      <div className="card">
        <button className="btn btn-warning btn-block" onClick={onLogout}><FiLogOut /> تسجيل الخروج</button>
      </div>
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><FiAlertCircle /> تأكيد إعادة التعيين</h3>
              <button className="modal-close" onClick={() => setShowReset(false)}><FiX /></button>
            </div>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>هل أنت متأكد؟ سيتم حذف جميع البيانات الحالية.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowReset(false)}>إلغاء</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { resetDemo(); setShowReset(false); setToast({ msg: '✅ تم إعادة تعيين البيانات بنجاح', type: 'success' }); }}>تأكيد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SETTINGS WRAPPER =====
function SettingsPageWrapper({ onLogout }) {
  const { resetDemo } = useApp();
  return <SettingsPage onLogout={onLogout} resetDemo={resetDemo} />;
}

// ===== MAIN APP =====
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('erp_theme') || 'light');
  const [user, setUser] = useState(() => localStorage.getItem('erp_user') || null);
  const [page, setPage] = useState(() => localStorage.getItem('erp_page') || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('erp_theme', theme); }, [theme]);
  useEffect(() => { if (user) localStorage.setItem('erp_user', user); else localStorage.removeItem('erp_user'); }, [user]);
  useEffect(() => { localStorage.setItem('erp_page', page); }, [page]);

  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');

  if (!user) return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LoginPage onLogin={(role) => { setUser(role); setPage('dashboard'); }} />
    </ThemeContext.Provider>
  );

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: FiHome },
    { id: 'products', label: 'المنتجات', icon: FiShoppingBag },
    { id: 'sales', label: 'البيع', icon: FiShoppingCart },
    { id: 'inventory', label: 'المخزون', icon: FiPackage },
    { id: 'purchases', label: 'المشتريات', icon: FiTruck },
    { id: 'debts', label: 'المديونيات', icon: FiCreditCard },
    { id: 'logs', label: 'السجلات', icon: FiFileText },
    { id: 'profit', label: 'الأرباح', icon: FiBarChart2 },
    { id: 'settings', label: 'الإعدادات', icon: FiSettings },
  ];

  const pageTitles = {
    dashboard: 'لوحة التحكم', products: 'المنتجات', sales: 'نقطة البيع',
    inventory: 'المخزون', purchases: 'المشتريات', debts: 'المديونيات',
    logs: 'السجلات اليومية', profit: 'الأرباح', settings: 'الإعدادات',
  };

  const renderPage = () => {
    const restricted = user === 'cashier' && !['dashboard', 'sales', 'inventory', 'logs', 'settings'].includes(page);
    if (restricted) return <EmptyState icon={<FiShield />} text="غير مصرح لك بالوصول" />;
    switch (page) {
      case 'dashboard': return <DashboardPage />;
      case 'products': return <ProductsPage />;
      case 'sales': return <SalesPage />;
      case 'inventory': return <InventoryPage />;
      case 'purchases': return <PurchasesPage />;
      case 'debts': return <DebtsPage />;
      case 'logs': return <LogsPage />;
      case 'profit': return <ProfitPage />;
      case 'settings': return <SettingsPageWrapper onLogout={() => setUser(null)} />;
      default: return <DashboardPage />;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AppProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-brand">
                <div className="sidebar-brand-icon"><FiShoppingBag /></div>
                <div className="sidebar-brand-text">
                  <h2>نظام إدارة الملابس</h2>
                  <span>ERP System</span>
                </div>
              </div>
            </div>
            <nav className="sidebar-nav">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`}
                    onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="sidebar-footer">
              <div className="sidebar-user">
                <div className="sidebar-user-avatar">{user === 'admin' ? <FiShield /> : <FiUser />}</div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user === 'admin' ? 'المدير' : 'الكاشير'}</div>
                  <div className="sidebar-user-role">{user === 'admin' ? 'Admin' : 'Cashier'}</div>
                </div>
                <button className="header-btn" onClick={() => setUser(null)} title="تسجيل الخروج" style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.1)', borderColor: 'transparent', color: 'rgba(255,255,255,0.6)' }}>
                  <FiLogOut size={14} />
                </button>
              </div>
            </div>
          </aside>
          <main className="main-content">
            <header className="header">
              <div className="header-left">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
                <h2 className="header-title">{pageTitles[page]}</h2>
              </div>
              <div className="header-right">
                <button className="header-btn" onClick={toggleTheme} title="تغيير السمة">
                  {theme === 'light' ? <FiMoon /> : <FiSun />}
                </button>
                <div className="header-user">
                  <div className="header-user-avatar">{user === 'admin' ? <FiShield /> : <FiUser />}</div>
                  {user === 'admin' ? 'مدير' : 'كاشير'}
                </div>
              </div>
            </header>
            <div className="page-content">{renderPage()}</div>
          </main>
          <nav className="bottom-nav">
            <div className="bottom-nav-inner">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} className={`bottom-nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
                    <Icon className="bnav-icon" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </AppProvider>
    </ThemeContext.Provider>
  );
}
