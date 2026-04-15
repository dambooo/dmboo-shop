'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { defaultProducts, formatPrice, categoryNames } from '@/lib/products';
import { useShop } from '@/lib/ShopContext';
import Toast from '../components/Toast';

export default function AdminPage() {
  const { showToast } = useShop();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editId, setEditId] = useState(null);
  const [orderDetailId, setOrderDetailId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    name: '', brand: '', desc: '', price: '', oldPrice: '', discount: '', category: '', badge: 'sale', image: ''
  });

  const loadProducts = useCallback(() => {
    const stored = localStorage.getItem('mn_shop_products');
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      localStorage.setItem('mn_shop_products', JSON.stringify(defaultProducts));
      setProducts(defaultProducts);
    }
  }, []);

  const loadOrders = useCallback(() => {
    setOrders(JSON.parse(localStorage.getItem('mn_shop_orders') || '[]'));
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  const saveProducts = (list) => {
    localStorage.setItem('mn_shop_products', JSON.stringify(list));
    setProducts(list);
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
        price: product.price,
        oldPrice: product.oldPrice || '',
        discount: product.discount || '',
        category: product.category,
        badge: product.badge || 'sale',
        image: product.image || ''
      });
    } else {
      setEditId(null);
      setForm({ name: '', brand: '', desc: '', price: '', oldPrice: '', discount: '', category: '', badge: 'sale', image: '' });
    }
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      desc: form.desc.trim(),
      price: parseInt(form.price) || 0,
      oldPrice: parseInt(form.oldPrice) || null,
      discount: parseInt(form.discount) || null,
      category: form.category,
      badge: form.badge,
      image: form.image.trim() || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop'
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

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const newOrders = orders.filter(o => o.status === 'Шинэ').length;
  const completedOrders = orders.filter(o => o.status !== 'Шинэ').length;
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const updateOrderStatus = (orderId, status) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    localStorage.setItem('mn_shop_orders', JSON.stringify(updated));
    setOrders(updated);
    showToast(`Захиалгын төлөв "${status}" болгож шинэчлэгдлээ`);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo">GEZEG</span>
          <span className="sidebar-subtitle">Admin Panel</span>
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
        </nav>
        <div className="sidebar-footer">
          <Link href="/" className="sidebar-back">← Дэлгүүр рүү</Link>
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
          </h1>
          <div className="admin-topbar-right">
            <span className="admin-date">{new Date().toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
                  <option value="all">Бүх ангилал</option>
                  <option value="shampoo">Шампунь</option>
                  <option value="conditioner">Кондиционер</option>
                  <option value="mask">Маск</option>
                  <option value="oil">Тос</option>
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
                        <th>Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p, idx) => (
                        <tr key={p.id}>
                          <td>{idx + 1}</td>
                          <td><img className="table-img" src={p.image} alt="" /></td>
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
                  <label>Тайлбар</label>
                  <input type="text" placeholder="Барааны товч тайлбар" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
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
                    <option value="shampoo">Шампунь</option>
                    <option value="conditioner">Кондиционер</option>
                    <option value="mask">Маск</option>
                    <option value="oil">Тос</option>
                    <option value="set">Багц</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Badge</label>
                  <select value={form.badge} onChange={e => setForm({...form, badge: e.target.value})}>
                    <option value="sale">Хямдрал (sale)</option>
                    <option value="new">Шинэ (new)</option>
                    <option value="hot">Эрэлттэй (hot)</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Зургийн URL</label>
                  <input type="url" placeholder="https://..." value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                  <small>Хоосон орхивол анхдагч зураг харуулна</small>
                </div>
                {form.image && (
                  <div className="form-group full-width">
                    <label>Зургийн урьдчилсан харагдац</label>
                    <img src={form.image} alt="preview" className="form-image-preview" />
                  </div>
                )}
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

      <Toast />
      </main>
    </div>
  );
}
