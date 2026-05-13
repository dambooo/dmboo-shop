'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { defaultProducts, formatPrice, categoryNames } from '@/lib/products';
import { useShop } from '@/lib/ShopContext';
import Toast from '../components/Toast';

const ORDERS_STORAGE_KEY = 'mn_shop_orders';
const INVENTORY_STORAGE_KEY = 'mn_shop_inventory_entries';
const INVENTORY_TABLE_MISSING_ERROR = 'inventory_table_missing';
const normalizeProducts = (list = []) => list.map(product => ({
  ...product,
  hidden: Boolean(product.hidden)
}));

export default function AdminPage() {
  const { showToast } = useShop();
  const [todayLabel, setTodayLabel] = useState('');
  const [isAuth, setIsAuth] = useState(null); // null = checking, false = not logged in, true = logged in
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventoryEntries, setInventoryEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editId, setEditId] = useState(null);
  const [orderDetailId, setOrderDetailId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryEditId, setInventoryEditId] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({
    productId: '',
    productName: '',
    buyerName: '',
    purchaseDate: new Date().toISOString().slice(0, 10),
    quantity: '1',
    purchasePrice: '',
    tax: '0',
    cargo: '0',
    sellPrice: '',
    note: ''
  });
  const [form, setForm] = useState({
    name: '', brand: '', desc: '', fullDesc: '', ingredients: '', howToUse: '', price: '', oldPrice: '', discount: '', category: '', badge: 'sale', image: '', hoverImage: '', hidden: false
  });
  const [uploading, setUploading] = useState({ main: false, hover: false });

  // Check auth on mount
  useEffect(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => setIsAuth(data.authenticated))
      .catch(() => setIsAuth(false));
  }, []);

  useEffect(() => {
    const formatted = new Intl.DateTimeFormat('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
    setTodayLabel(formatted);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuth(true);
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Нэвтрэхэд алдаа гарлаа');
      }
    } catch {
      setLoginError('Сервертэй холбогдох боломжгүй');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuth(false);
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({
          ...prev,
          [type === 'main' ? 'image' : 'hoverImage']: data.url
        }));
      } else {
        showToast(data.error || 'Зураг оруулахад алдаа гарлаа');
      }
    } catch {
      showToast('Зураг оруулахад алдаа гарлаа');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const loadProducts = useCallback(() => {
    fetch('/api/products?includeHidden=1')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(normalizeProducts(data));
        } else {
          setProducts(normalizeProducts(defaultProducts));
        }
      })
      .catch(() => setProducts(normalizeProducts(defaultProducts)));
  }, []);

  const loadOrders = useCallback(() => {
    setOrders(JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]'));
  }, []);

  const loadInventoryEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setInventoryEntries(data);
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(data));
        return;
      }
      throw new Error(data?.error || 'inventory_load_failed');
    } catch {
      setInventoryEntries(JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || '[]'));
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadInventoryEntries();
  }, [loadProducts, loadOrders, loadInventoryEntries]);

  const saveProducts = (list) => {
    const normalizedList = normalizeProducts(list);
    setProducts(normalizedList);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedList),
    }).catch(() => {});
  };

  const filteredProducts = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    }
    return true;
  });

  const openProductForm = (product) => {
    if (product) {
      setEditId(product.id);
      setForm({
        name: product.name,
        brand: product.brand,
        desc: product.desc || '',
        fullDesc: product.fullDesc || '',
        ingredients: product.ingredients || '',
        howToUse: product.howToUse || '',
        price: product.price,
        oldPrice: product.oldPrice || '',
        discount: product.discount || '',
        category: product.category,
        badge: product.badge || 'sale',
        image: product.image || '',
        hoverImage: product.hoverImage || '',
        hidden: Boolean(product.hidden)
      });
    } else {
      setEditId(null);
      setForm({ name: '', brand: '', desc: '', fullDesc: '', ingredients: '', howToUse: '', price: '', oldPrice: '', discount: '', category: '', badge: 'sale', image: '', hoverImage: '', hidden: false });
    }
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      desc: form.desc.trim(),
      fullDesc: form.fullDesc.trim() || null,
      ingredients: form.ingredients.trim() || null,
      howToUse: form.howToUse.trim() || null,
      price: parseInt(form.price) || 0,
      oldPrice: parseInt(form.oldPrice) || null,
      discount: parseInt(form.discount) || null,
      category: form.category,
      badge: form.badge,
      image: form.image.trim() || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
      hoverImage: form.hoverImage.trim() || null,
      hidden: Boolean(form.hidden)
    };

    let updated;
    if (editId) {
      updated = products.map(p => p.id === editId ? { ...p, ...productData } : p);
      showToast('Бараа амжилттай шинэчлэгдлээ!');
    } else {
      const nextId = products.length === 0 ? 1 : Math.max(...products.map(p => p.id)) + 1;
      updated = [...products, { ...productData, id: nextId }];
      showToast('Шинэ бараа амжилттай нэмэгдлээ!');
    }
    saveProducts(updated);
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget === null) return;
    const updated = products.filter(p => p.id !== deleteTarget);
    saveProducts(updated);
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    showToast('Бараа амжилттай устгагдлаа!');
  };

  const handleToggleProductVisibility = (productId, isVisible) => {
    const updated = products.map(product => (
      product.id === productId
        ? { ...product, hidden: !isVisible }
        : product
    ));
    saveProducts(updated);
    showToast(isVisible ? 'Бараа сайт дээр харагдах боллоо' : 'Бараа сайтаас нуугдлаа');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const newOrders = orders.filter(o => o.status === 'Шинэ').length;
  const completedOrders = orders.filter(o => o.status !== 'Шинэ').length;
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const updateOrderStatus = (orderId, status) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    setOrders(updated);
    showToast(`Захиалгын төлөв "${status}" болгож шинэчлэгдлээ`);
  };

  const saveInventoryEntries = async (entries) => {
    setInventoryEntries(entries);
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(entries));

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === INVENTORY_TABLE_MISSING_ERROR) {
          showToast('Supabase дээр inventory_entries table үүсээгүй байна. Одоогоор local хадгалалт ашиглагдаж байна.');
          return;
        }
        throw new Error(data?.error || 'inventory_save_failed');
      }
    } catch {
      showToast('Интернет эсвэл серверийн алдаанаас шалтгаалж локал хадгалалт руу шилжлээ');
    }
  };

  const resetInventoryForm = () => {
    setInventoryForm({
      productId: '',
      productName: '',
      buyerName: '',
      purchaseDate: new Date().toISOString().slice(0, 10),
      quantity: '1',
      purchasePrice: '',
      tax: '0',
      cargo: '0',
      sellPrice: '',
      note: ''
    });
  };

  const openInventoryForm = (entry = null) => {
    if (entry) {
      setInventoryEditId(entry.id);
      setInventoryForm({
        productId: entry.productId ? String(entry.productId) : '',
        productName: entry.productName || '',
        buyerName: entry.buyerName || '',
        purchaseDate: entry.purchaseDate || new Date().toISOString().slice(0, 10),
        quantity: String(entry.quantity || 1),
        purchasePrice: String(entry.purchasePrice || 0),
        tax: String(entry.tax || 0),
        cargo: String(entry.cargo || 0),
        sellPrice: String(entry.sellPrice || 0),
        note: entry.note || ''
      });
    } else {
      setInventoryEditId(null);
      resetInventoryForm();
    }
    setInventoryModalOpen(true);
  };

  const handleInventorySave = async (e) => {
    e.preventDefault();

    const qty = Math.max(1, parseInt(inventoryForm.quantity, 10) || 1);
    const purchasePrice = Math.max(0, parseFloat(inventoryForm.purchasePrice) || 0);
    const tax = Math.max(0, parseFloat(inventoryForm.tax) || 0);
    const cargo = Math.max(0, parseFloat(inventoryForm.cargo) || 0);
    const sellPrice = Math.max(0, parseFloat(inventoryForm.sellPrice) || 0);
    const selectedProduct = products.find(p => String(p.id) === inventoryForm.productId);
    const productName = (selectedProduct?.name || inventoryForm.productName || '').trim();
    const buyerName = inventoryForm.buyerName.trim();

    if (!productName) {
      showToast('Бараа сонгох эсвэл барааны нэр оруулна уу');
      return;
    }

    if (!buyerName) {
      showToast('Худалдан авсан хүний нэр заавал оруулна');
      return;
    }

    const row = {
      productId: selectedProduct?.id || null,
      productName,
      buyerName,
      purchaseDate: inventoryForm.purchaseDate || new Date().toISOString().slice(0, 10),
      quantity: qty,
      purchasePrice,
      tax,
      cargo,
      sellPrice,
      note: inventoryForm.note.trim() || null
    };

    let updatedEntries;
    if (inventoryEditId) {
      updatedEntries = inventoryEntries.map(entry => entry.id === inventoryEditId ? { ...entry, ...row } : entry);
      showToast('Агуулахын бүртгэл шинэчлэгдлээ');
    } else {
      const nextId = inventoryEntries.length === 0 ? 1 : Math.max(...inventoryEntries.map(entry => entry.id)) + 1;
      updatedEntries = [...inventoryEntries, { ...row, id: nextId, createdAt: new Date().toISOString() }];
      showToast('Агуулахын бүртгэл амжилттай нэмэгдлээ');
    }

    await saveInventoryEntries(updatedEntries);
    setInventoryModalOpen(false);
    setInventoryEditId(null);
    resetInventoryForm();
  };

  const deleteInventoryEntry = async (id) => {
    const entry = inventoryEntries.find(item => item.id === id);
    if (!entry) return;

    const confirmed = window.confirm(`"${entry.productName}" бүртгэлийг устгах уу?`);
    if (!confirmed) return;

    await saveInventoryEntries(inventoryEntries.filter(item => item.id !== id));
    showToast('Агуулахын бүртгэл устгагдлаа');
  };

  const exportInventoryCSV = () => {
    if (inventoryEntries.length === 0) {
      showToast('CSV гаргах өгөгдөл алга');
      return;
    }

    const rows = [
      ['Огноо', 'Бараа', 'Худалдан авсан хүн', 'Тоо ширхэг', 'Худ. үнэ', 'Татвар', 'Карго', 'Борлуулах үнэ', 'Тэмдэглэл'],
      ...[...inventoryEntries]
        .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
        .map(entry => [
          entry.purchaseDate || '',
          entry.productName || '',
          entry.buyerName || '',
          entry.quantity || 0,
          entry.purchasePrice || 0,
          entry.tax || 0,
          entry.cargo || 0,
          entry.sellPrice || 0,
          entry.note || ''
        ])
    ];

    const csv = rows
      .map(row => row
        .map(cell => {
          const value = String(cell ?? '').replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(','))
      .join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV файл татаж авлаа');
  };

  const totalPurchasedQty = inventoryEntries.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
  const completedOrderItems = orders
    .filter(order => order.status !== 'Шинэ')
    .flatMap(order => order.items || []);
  const soldByProductKey = completedOrderItems.reduce((acc, item) => {
    const matchedProduct = products.find(product => product.name === item.name);
    const qty = item.qty || 0;

    if (matchedProduct?.id) {
      const productIdKey = `id:${matchedProduct.id}`;
      acc[productIdKey] = (acc[productIdKey] || 0) + qty;
    }

    const nameKey = `name:${(item.name || '').trim().toLowerCase()}`;
    acc[nameKey] = (acc[nameKey] || 0) + qty;
    return acc;
  }, {});

  const totalInventoryCost = inventoryEntries.reduce((sum, entry) => {
    return sum + ((entry.purchasePrice || 0) * (entry.quantity || 0)) + (entry.tax || 0) + (entry.cargo || 0);
  }, 0);
  const totalProjectedSales = inventoryEntries.reduce((sum, entry) => {
    return sum + ((entry.sellPrice || 0) * (entry.quantity || 0));
  }, 0);
  const inventoryByProduct = Object.values(inventoryEntries.reduce((acc, entry) => {
    const key = entry.productId || entry.productName;
    if (!acc[key]) {
      acc[key] = {
        key,
        productName: entry.productName,
        quantity: 0,
        weightedCost: 0,
        sellPrice: entry.sellPrice || 0,
        soldQty: 0,
        remainingQty: 0
      };
    }
    acc[key].quantity += entry.quantity || 0;
    acc[key].weightedCost += ((entry.purchasePrice || 0) * (entry.quantity || 0)) + (entry.tax || 0) + (entry.cargo || 0);
    if (entry.sellPrice) {
      acc[key].sellPrice = entry.sellPrice;
    }
    return acc;
  }, {})).map(item => {
    const soldFromId = typeof item.key === 'number' ? (soldByProductKey[`id:${item.key}`] || 0) : 0;
    const soldFromName = soldByProductKey[`name:${(item.productName || '').trim().toLowerCase()}`] || 0;
    const soldQty = Math.max(soldFromId, soldFromName);
    const remainingQty = item.quantity - soldQty;
    return {
      ...item,
      soldQty,
      remainingQty
    };
  }).sort((a, b) => b.remainingQty - a.remainingQty);

  const totalSoldQty = inventoryByProduct.reduce((sum, item) => sum + (item.soldQty || 0), 0);
  const totalRemainingQty = inventoryByProduct.reduce((sum, item) => sum + (item.remainingQty || 0), 0);

  // Loading state
  if (isAuth === null) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <div className="admin-login-logo">GEZEG</div>
          <p style={{color:'#888'}}>Шалгаж байна...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuth) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <div className="admin-login-logo">GEZEG</div>
          <h2 className="admin-login-title">Удирдлагын самбар</h2>
          <p className="admin-login-subtitle">Нэвтрэхийн тулд нууц үгээ оруулна уу</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              placeholder="Нууц үг"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
              autoFocus
              className="admin-login-input"
            />
            {loginError && <p className="admin-login-error">{loginError}</p>}
            <button type="submit" className="admin-login-btn" disabled={loginLoading}>
              {loginLoading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>
          <Link href="/" className="admin-login-back">← Дэлгүүр рүү буцах</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo">GEZEG</span>
          <span className="sidebar-subtitle">Удирдлагын самбар</span>
        </div>
        <nav className="sidebar-nav">
          <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="sidebar-icon">📊</span> Хянах самбар
          </button>
          <button className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <span className="sidebar-icon">📦</span> Бүтээгдэхүүн
            <span className="sidebar-badge">{products.length}</span>
          </button>
          <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); loadOrders(); }}>
            <span className="sidebar-icon">🛒</span> Захиалгууд
            {newOrders > 0 && <span className="sidebar-badge new">{newOrders}</span>}
          </button>
          <button className={`sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => { setActiveTab('inventory'); loadInventoryEntries(); }}>
            <span className="sidebar-icon">🏬</span> Агуулах
            <span className="sidebar-badge">{inventoryEntries.length}</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <Link href="/" className="sidebar-back">← Дэлгүүр рүү</Link>
          <button className="sidebar-logout" onClick={handleLogout}>🚪 Гарах</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h1 className="admin-page-title">
            {activeTab === 'dashboard' && 'Хянах самбар'}
            {activeTab === 'products' && 'Бүтээгдэхүүн'}
            {activeTab === 'orders' && 'Захиалгууд'}
            {activeTab === 'inventory' && 'Агуулах'}
          </h1>
          <div className="admin-topbar-right">
            <span className="admin-date" suppressHydrationWarning>{todayLabel}</span>
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            <div className="dash-cards">
              <div className="dash-card dash-card-blue">
                <div className="dash-card-icon">📦</div>
                <div className="dash-card-info">
                  <span className="dash-card-number">{products.length}</span>
                  <span className="dash-card-label">Нийт бараа</span>
                </div>
              </div>
              <div className="dash-card dash-card-green">
                <div className="dash-card-icon">🛒</div>
                <div className="dash-card-info">
                  <span className="dash-card-number">{orders.length}</span>
                  <span className="dash-card-label">Нийт захиалга</span>
                </div>
              </div>
              <div className="dash-card dash-card-orange">
                <div className="dash-card-icon">⏳</div>
                <div className="dash-card-info">
                  <span className="dash-card-number">{newOrders}</span>
                  <span className="dash-card-label">Шинэ захиалга</span>
                </div>
              </div>
              <div className="dash-card dash-card-purple">
                <div className="dash-card-icon">💰</div>
                <div className="dash-card-info">
                  <span className="dash-card-number">{formatPrice(totalRevenue)}</span>
                  <span className="dash-card-label">Нийт орлого</span>
                </div>
              </div>
            </div>

            <div className="dash-grid">
              <div className="dash-panel">
                <h3 className="dash-panel-title">Ангилал бүрийн бараа</h3>
                <div className="dash-category-list">
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <div className="dash-category-row" key={cat}>
                      <span className="dash-cat-name">{categoryNames[cat] || cat}</span>
                      <div className="dash-cat-bar-wrap">
                        <div className="dash-cat-bar" style={{ width: `${(count / products.length) * 100}%` }} />
                      </div>
                      <span className="dash-cat-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dash-panel">
                <h3 className="dash-panel-title">Сүүлийн захиалгууд</h3>
                {orders.length > 0 ? (
                  <div className="dash-recent-orders">
                    {[...orders].reverse().slice(0, 5).map(o => (
                      <div className="dash-order-row" key={o.id}>
                        <div>
                          <span className="dash-order-phone">{o.phone}</span>
                          <span className="dash-order-date">{o.date}</span>
                        </div>
                        <div>
                          <span className="dash-order-total">{formatPrice(o.total)}</span>
                          <span className={`order-status-sm status-${o.status === 'Шинэ' ? 'new' : 'done'}`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dash-empty">Захиалга байхгүй</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
        <>
          <section className="admin-toolbar">
            <div className="container toolbar-inner">
              <div className="toolbar-left">
                <h2>Бүтээгдэхүүний жагсаалт</h2>
              </div>
              <div className="toolbar-right">
                <input type="text" placeholder="Бараа хайх..." value={search} onChange={e => setSearch(e.target.value)} />
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                  <option value="all">Бүгд</option>
                  <option value="hair">Үс арчилгаа</option>
                  <option value="body">Бие арчилгаа</option>
                  <option value="lip">Уруул</option>
                  <option value="set">Багц</option>
                </select>
                <button className="btn-add" onClick={() => openProductForm(null)}>+ Шинэ бараа нэмэх</button>
              </div>
            </div>
          </section>

          <section className="admin-content">
            <div className="container">
              {filteredProducts.length > 0 ? (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Зураг</th>
                        <th>Нэр</th>
                        <th>Брэнд</th>
                        <th>Ангилал</th>
                        <th>Үнэ</th>
                        <th>Хуучин үнэ</th>
                        <th>Хямдрал</th>
                        <th>Сайт дээр</th>
                        <th>Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p, idx) => (
                        <tr key={p.id}>
                          <td>{idx + 1}</td>
                          <td>
                            <div className="table-img-group">
                              <img className="table-img" src={p.image} alt="" />
                              {p.hoverImage && <img className="table-img table-img-hover" src={p.hoverImage} alt="hover" />}
                            </div>
                          </td>
                          <td>
                            <div className="table-name">{p.name}</div>
                            <div className="table-brand">{p.brand}</div>
                          </td>
                          <td>{p.brand}</td>
                          <td><span className="category-tag">{categoryNames[p.category] || p.category}</span></td>
                          <td className="table-price">{formatPrice(p.price)}</td>
                          <td>{p.oldPrice ? <span className="table-old-price">{formatPrice(p.oldPrice)}</span> : '-'}</td>
                          <td>{p.discount ? <span className="table-discount">-{p.discount}%</span> : '-'}</td>
                          <td>
                            <label className="visibility-check">
                              <input
                                type="checkbox"
                                checked={!p.hidden}
                                onChange={e => handleToggleProductVisibility(p.id, e.target.checked)}
                              />
                              <span>{p.hidden ? 'Нуугдсан' : 'Харагдана'}</span>
                            </label>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="btn-edit" onClick={() => openProductForm(p)}>✏️ Засах</button>
                              <button className="btn-del" onClick={() => { setDeleteTarget(p.id); setDeleteModalOpen(true); }}>🗑️ Устгах</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-empty">Бараа олдсонгүй</p>
              )}
            </div>
          </section>
        </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <section className="admin-content">
            <div className="container">
              <div className="admin-toolbar" style={{ marginBottom: 20 }}>
                <div className="toolbar-inner">
                  <h2>Захиалгын жагсаалт</h2>
                  <div className="toolbar-right">
                    <span className="order-summary-text">Нийт: {orders.length} | Шинэ: {newOrders} | Биелсэн: {completedOrders}</span>
                  </div>
                </div>
              </div>
              {orders.length > 0 ? (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Огноо</th>
                        <th>Утас</th>
                        <th>Барааууд</th>
                        <th>Нийт дүн</th>
                        <th>Төлөв</th>
                        <th>Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...orders].reverse().map((o, idx) => (
                        <tr key={o.id}>
                          <td>{orders.length - idx}</td>
                          <td>{o.date}</td>
                          <td><strong>{o.phone}</strong></td>
                          <td>
                            <ul className="order-items-list">
                              {o.items.map((i, j) => (
                                <li key={j}>{i.name} <span className="order-qty">x{i.qty}</span> — {formatPrice(i.price * i.qty)}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="table-price">{formatPrice(o.total)}</td>
                          <td><span className={`order-status status-${o.status === 'Шинэ' ? 'new' : 'done'}`}>{o.status}</span></td>
                          <td>
                            <div className="table-actions">
                              {o.status === 'Шинэ' ? (
                                <button className="btn-confirm" onClick={() => updateOrderStatus(o.id, 'Биелсэн')}>✅ Биелүүлэх</button>
                              ) : (
                                <button className="btn-revert" onClick={() => updateOrderStatus(o.id, 'Шинэ')}>↩️ Буцаах</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-empty">Захиалга байхгүй байна</p>
              )}
            </div>
          </section>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <section className="admin-content">
            <div className="container">
              <div className="admin-toolbar" style={{ marginBottom: 20 }}>
                <div className="toolbar-inner">
                  <h2>Худалдан авалт ба агуулахын бүртгэл</h2>
                  <div className="toolbar-right">
                    <button className="btn-add" onClick={() => openInventoryForm(null)}>+ Бүртгэл нэмэх</button>
                    <button className="btn-edit" onClick={exportInventoryCSV}>⬇ CSV татах</button>
                  </div>
                </div>
              </div>

              <div className="inventory-summary-grid">
                <div className="inventory-summary-card">
                  <span className="inventory-summary-label">Нийт бичлэг</span>
                  <strong className="inventory-summary-value">{inventoryEntries.length}</strong>
                </div>
                <div className="inventory-summary-card">
                  <span className="inventory-summary-label">Нийт орсон ширхэг</span>
                  <strong className="inventory-summary-value">{totalPurchasedQty}</strong>
                </div>
                <div className="inventory-summary-card">
                  <span className="inventory-summary-label">Нийт өртөг</span>
                  <strong className="inventory-summary-value">{formatPrice(Math.round(totalInventoryCost))}</strong>
                </div>
                <div className="inventory-summary-card">
                  <span className="inventory-summary-label">Борлуулалтын дүн (тооцоолол)</span>
                  <strong className="inventory-summary-value">{formatPrice(Math.round(totalProjectedSales))}</strong>
                </div>
                <div className="inventory-summary-card">
                  <span className="inventory-summary-label">Борлуулсан ширхэг (биелсэн захиалга)</span>
                  <strong className="inventory-summary-value">{totalSoldQty}</strong>
                </div>
                <div className="inventory-summary-card">
                  <span className="inventory-summary-label">Үлдэгдэл ширхэг</span>
                  <strong className="inventory-summary-value">{totalRemainingQty}</strong>
                </div>
              </div>

              {inventoryEntries.length > 0 ? (
                <>
                  <div className="table-wrapper" style={{ marginBottom: 20 }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Огноо</th>
                          <th>Бараа</th>
                          <th>Худалдан авсан хүн</th>
                          <th>Тоо ширхэг</th>
                          <th>Худ. үнэ</th>
                          <th>Татвар</th>
                          <th>Карго</th>
                          <th>Борлуулах үнэ</th>
                          <th>Үйлдэл</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...inventoryEntries].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)).map(entry => (
                          <tr key={entry.id}>
                            <td>{entry.purchaseDate}</td>
                            <td>
                              <div className="table-name">{entry.productName}</div>
                              {entry.note && <div className="table-brand">Тэмдэглэл: {entry.note}</div>}
                            </td>
                            <td>{entry.buyerName}</td>
                            <td>{entry.quantity}</td>
                            <td className="table-price">{formatPrice(Math.round(entry.purchasePrice || 0))}</td>
                            <td>{formatPrice(Math.round(entry.tax || 0))}</td>
                            <td>{formatPrice(Math.round(entry.cargo || 0))}</td>
                            <td className="table-price">{formatPrice(Math.round(entry.sellPrice || 0))}</td>
                            <td>
                              <div className="table-actions">
                                <button className="btn-edit" onClick={() => openInventoryForm(entry)}>✏️ Засах</button>
                                <button className="btn-del" onClick={() => deleteInventoryEntry(entry.id)}>🗑️ Устгах</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Бараа</th>
                          <th>Оруулсан тоо</th>
                          <th>Борлуулсан тоо</th>
                          <th>Үлдэгдэл</th>
                          <th>Дундаж өртөг/ширхэг</th>
                          <th>Санал болгосон борлуулах үнэ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryByProduct.map(item => {
                          const avgCost = item.quantity > 0 ? item.weightedCost / item.quantity : 0;
                          return (
                            <tr key={item.key}>
                              <td>{item.productName}</td>
                              <td><strong>{item.quantity}</strong></td>
                              <td>{item.soldQty}</td>
                              <td><strong>{item.remainingQty}</strong></td>
                              <td>{formatPrice(Math.round(avgCost))}</td>
                              <td>{formatPrice(Math.round(item.sellPrice || 0))}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="admin-empty">Агуулахын бүртгэл байхгүй байна</p>
              )}
            </div>
          </section>
        )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <>
          <div className="admin-modal-overlay open" onClick={() => setModalOpen(false)}></div>
          <div className="admin-modal open">
            <div className="admin-modal-header">
              <h3>{editId ? 'Бараа засах' : 'Шинэ бараа нэмэх'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Барааны нэр *</label>
                  <input type="text" required placeholder="Жишээ: WELLA FUSION SHAMPOO 250ML" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Брэнд *</label>
                  <input type="text" required placeholder="Жишээ: WELLA PROFESSIONALS" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>Товч тайлбар</label>
                  <input type="text" placeholder="Барааны товч тайлбар" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>Дэлгэрэнгүй тайлбар</label>
                  <textarea rows="3" placeholder="Барааны дэлгэрэнгүй тайлбар" value={form.fullDesc} onChange={e => setForm({...form, fullDesc: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>Орцууд</label>
                  <textarea rows="2" placeholder="Жишээ: Кокосын тос, алоэ вера, витамин E..." value={form.ingredients} onChange={e => setForm({...form, ingredients: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>Хэрэглэх заавар</label>
                  <textarea rows="2" placeholder="Жишээ: Чийгтэй үсэнд хэрэглэж, массаж хийнэ..." value={form.howToUse} onChange={e => setForm({...form, howToUse: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Үнэ (₮) *</label>
                  <input type="number" required min="0" placeholder="51120" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Хуучин үнэ (₮)</label>
                  <input type="number" min="0" placeholder="63900" value={form.oldPrice} onChange={e => setForm({...form, oldPrice: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Хямдралын хувь (%)</label>
                  <input type="number" min="0" max="99" placeholder="20" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ангилал *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="">Сонгох...</option>
                    <option value="hair">Үс</option>
                    <option value="body">Бие</option>
                    <option value="lip">Уруул</option>
                    <option value="set">Багц</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Тэмдэглэгээ</label>
                  <select value={form.badge} onChange={e => setForm({...form, badge: e.target.value})}>
                    <option value="sale">Хямдрал</option>
                    <option value="new">Шинэ</option>
                    <option value="hot">Эрэлттэй</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={form.hidden}
                      onChange={e => setForm({ ...form, hidden: e.target.checked })}
                    />
                    <span>Сайт дээр нуух</span>
                  </label>
                  <small>Чагталсан үед энэ бараа админд харагдах боловч дэлгүүрийн сайт дээр харагдахгүй.</small>
                </div>
                <div className="form-group full-width">
                  <label>Үндсэн зураг</label>
                  <div className="image-upload-area">
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => handleImageUpload(e.target.files[0], 'main')} />
                    {uploading.main && <span className="upload-status">Оруулж байна...</span>}
                  </div>
                  <input type="text" placeholder="Эсвэл URL оруулна уу..." value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={{marginTop: 8}} />
                  {form.image && <img src={form.image} alt="preview" className="form-image-preview" />}
                </div>
                <div className="form-group full-width">
                  <label>Hover зураг (хулганаа аваачихад харагдах)</label>
                  <div className="image-upload-area">
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => handleImageUpload(e.target.files[0], 'hover')} />
                    {uploading.hover && <span className="upload-status">Оруулж байна...</span>}
                  </div>
                  <input type="text" placeholder="Эсвэл URL оруулна уу..." value={form.hoverImage} onChange={e => setForm({...form, hoverImage: e.target.value})} style={{marginTop: 8}} />
                  {form.hoverImage && <img src={form.hoverImage} alt="hover preview" className="form-image-preview" />}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Болих</button>
                <button type="submit" className="btn-save">{editId ? 'Шинэчлэх' : 'Хадгалах'}</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <>
          <div className="admin-modal-overlay open" onClick={() => setDeleteModalOpen(false)}></div>
          <div className="admin-modal open delete-modal">
            <div className="delete-icon">🗑️</div>
            <h3>Бараа устгах</h3>
            <p>&ldquo;{products.find(p => p.id === deleteTarget)?.name}&rdquo;</p>
            <p className="delete-warning">Энэ үйлдлийг буцаах боломжгүй!</p>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setDeleteModalOpen(false)}>Болих</button>
              <button className="btn-delete" onClick={handleDelete}>Устгах</button>
            </div>
          </div>
        </>
      )}

      {/* Inventory Modal */}
      {inventoryModalOpen && (
        <>
          <div className="admin-modal-overlay open" onClick={() => setInventoryModalOpen(false)}></div>
          <div className="admin-modal open">
            <div className="admin-modal-header">
              <h3>{inventoryEditId ? 'Агуулахын бүртгэл засах' : 'Агуулахын шинэ бүртгэл'}</h3>
              <button className="modal-close" onClick={() => setInventoryModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleInventorySave}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Бараа (жагсаалтаас)</label>
                  <select
                    value={inventoryForm.productId}
                    onChange={e => {
                      const productId = e.target.value;
                      const product = products.find(item => String(item.id) === productId);
                      setInventoryForm(prev => ({
                        ...prev,
                        productId,
                        productName: product?.name || prev.productName,
                        sellPrice: product ? String(product.price || '') : prev.sellPrice
                      }));
                    }}
                  >
                    <option value="">Сонгох...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Барааны нэр *</label>
                  <input
                    type="text"
                    required
                    value={inventoryForm.productName}
                    onChange={e => setInventoryForm(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Жишээ: CLASSIC CLEAN SHAMPOO"
                  />
                </div>
                <div className="form-group">
                  <label>Худалдан авсан хүн *</label>
                  <input
                    type="text"
                    required
                    value={inventoryForm.buyerName}
                    onChange={e => setInventoryForm(prev => ({ ...prev, buyerName: e.target.value }))}
                    placeholder="Нэр / байгууллага"
                  />
                </div>
                <div className="form-group">
                  <label>Худалдан авсан огноо *</label>
                  <input
                    type="date"
                    required
                    value={inventoryForm.purchaseDate}
                    onChange={e => setInventoryForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Тоо ширхэг *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inventoryForm.quantity}
                    onChange={e => setInventoryForm(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Худалдаж авсан үнэ (1 ширхэг) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={inventoryForm.purchasePrice}
                    onChange={e => setInventoryForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    placeholder="₮"
                  />
                </div>
                <div className="form-group">
                  <label>Татвар (нийт)</label>
                  <input
                    type="number"
                    min="0"
                    value={inventoryForm.tax}
                    onChange={e => setInventoryForm(prev => ({ ...prev, tax: e.target.value }))}
                    placeholder="₮"
                  />
                </div>
                <div className="form-group">
                  <label>Карго (нийт)</label>
                  <input
                    type="number"
                    min="0"
                    value={inventoryForm.cargo}
                    onChange={e => setInventoryForm(prev => ({ ...prev, cargo: e.target.value }))}
                    placeholder="₮"
                  />
                </div>
                <div className="form-group">
                  <label>Борлуулах үнэ (1 ширхэг) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={inventoryForm.sellPrice}
                    onChange={e => setInventoryForm(prev => ({ ...prev, sellPrice: e.target.value }))}
                    placeholder="₮"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Тэмдэглэл</label>
                  <textarea
                    rows="2"
                    value={inventoryForm.note}
                    onChange={e => setInventoryForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Нэмэлт тэмдэглэл"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setInventoryModalOpen(false)}>Болих</button>
                <button type="submit" className="btn-save">{inventoryEditId ? 'Шинэчлэх' : 'Хадгалах'}</button>
              </div>
            </form>
          </div>
        </>
      )}

      <Toast />
      </main>
    </div>
  );
}
