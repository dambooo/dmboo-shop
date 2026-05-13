'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/lib/ShopContext';
import { formatPrice, categoryNames } from '@/lib/products';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import CartSidebar from '@/app/components/CartSidebar';
import CheckoutModal from '@/app/components/CheckoutModal';
import Toast from '@/app/components/Toast';
import ProductCard from '@/app/components/ProductCard';

export default function ProductPage() {
  const { id } = useParams();
  const { products, addToCart, refreshProducts } = useShop();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(null);

  useEffect(() => { refreshProducts(); }, [refreshProducts]);

  useEffect(() => {
    const handler = () => setCartOpen(prev => !prev);
    window.addEventListener('toggleCart', handler);
    return () => window.removeEventListener('toggleCart', handler);
  }, []);

  const product = products.find(p => String(p.id) === id);

  if (!product) {
    return (
      <>
        <Header />
        <div style={{textAlign:'center',padding:'120px 20px'}}>
          <h2>Бүтээгдэхүүн олдсонгүй</h2>
          <Link href="/" style={{color:'#8B6914',marginTop:'16px',display:'inline-block'}}>← Нүүр хуудас руу буцах</Link>
        </div>
        <Footer />
      </>
    );
  }

  const images = [product.image, product.hoverImage].filter(Boolean);
  const catLabel = categoryNames[product.category] || product.category;
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const productDetails = [
    {
      title: 'ДЭЛГЭРЭНГҮЙ',
      content: product.fullDesc || product.desc
    },
    {
      title: 'ОРЦУУД',
      content: product.ingredients
    },
    {
      title: 'ХЭРЭГЛЭХ ЗААВАР',
      content: product.howToUse
    },
  ].filter(d => d.content);

  const handleAddToCart = () => {
    addToCart(product.id, qty);
  };

  const handleBuyNow = () => {
    addToCart(product.id, qty);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <Header />

      <div className="pdp-container">
        {/* Breadcrumb */}
        <div className="pdp-breadcrumb">
          <Link href="/">Нүүр</Link>
          <span>/</span>
          <a href="/#products">{catLabel}</a>
          <span>/</span>
          <span className="pdp-breadcrumb-current">{product.name}</span>
        </div>

        {/* Product main section */}
        <div className="pdp-main">
          {/* Images */}
          <div className="pdp-gallery">
            <div className="pdp-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pdp-thumb ${activeImage === i ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="pdp-main-image">
              <img src={images[activeImage]} alt={product.name} />
              {product.badge && (
                <span className={`badge ${product.badge === 'sale' ? 'badge-sale' : product.badge === 'new' ? 'badge-new' : 'badge-hot'}`}>
                  {product.badge === 'sale' ? `-${product.discount}%` : product.badge === 'new' ? 'Шинэ' : 'Эрэлттэй'}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="pdp-info">
            <div className="pdp-brand">{product.brand}</div>
            <h1 className="pdp-title">{product.name}</h1>

            {product.rating && (
              <div className="pdp-rating">
                <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
                <span className="pdp-rating-count">{product.rating} | {product.reviews} СЭТГЭГДЭЛ</span>
              </div>
            )}

            <div className="pdp-price-row">
              <span className="pdp-price">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="pdp-old-price">{formatPrice(product.oldPrice)}</span>}
            </div>

            <p className="pdp-desc">{product.desc}</p>

            <div className="pdp-qty-row">
              <div className="pdp-qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button className="pdp-add-btn" onClick={handleAddToCart}>
                САГСАНД НЭМЭХ — {formatPrice(product.price * qty)}
              </button>
            </div>

            <button className="pdp-buy-btn" onClick={handleBuyNow}>
              ЗАХИАЛАХ
            </button>

            <div className="pdp-features">
              <div className="pdp-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Байгалийн гаралтай органик бүтээгдэхүүн</span>
              </div>
              <div className="pdp-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34"/><path d="M3 15h3.5l.88-3.07a1 1 0 0 1 .95-.93h5.34a1 1 0 0 1 .95.93L15.5 15H19"/><circle cx="18" cy="18" r="3"/><circle cx="9" cy="18" r="3"/><path d="M19 12h2l2 3v4h-3"/></svg>
                <span>Хурдан хүргэлт</span>
              </div>
              <div className="pdp-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                <span>Байгальд ээлтэй</span>
              </div>
            </div>

            {/* Accordion details */}
            <div className="pdp-details">
              {productDetails.map((detail, i) => (
                <div className="pdp-detail-item" key={i}>
                  <button
                    className={`pdp-detail-toggle ${openDetail === i ? 'open' : ''}`}
                    onClick={() => setOpenDetail(openDetail === i ? null : i)}
                  >
                    {detail.title}
                    <span>+</span>
                  </button>
                  <div className={`pdp-detail-content ${openDetail === i ? 'open' : ''}`}>
                    {detail.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="pdp-related">
            <h2 className="pdp-related-title">Ижил төстэй бүтээгдэхүүнүүд</h2>
            <div className="product-grid pdp-related-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} onOpenModal={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <Toast />
    </>
  );
}
