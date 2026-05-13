'use client';

import { useState, useEffect, useRef } from 'react';
import { useShop } from '@/lib/ShopContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ProductCarousel from './components/ProductCarousel';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import Toast from './components/Toast';

export default function Home() {
  const { products, productsLoaded, refreshProducts } = useShop();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.fade-section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const heroSlides = [
    {
      image: '/banners/hero-1.jpg',
      subtitle: '2000+ сэтгэгдэл',
      title: 'Байгалийн гаралтай үс арчилгаа.',
      desc: 'ТАНЫ ҮС, ТАНЫ ГАЙХАМШИГ',
      btn: 'SHOP NOW',
    },
    {
      image: '/banners/hero-2.jpg',
      subtitle: 'Шинэ цуврал',
      title: 'Гүн тэжээллэг маск',
      desc: 'БАЙГАЛИЙН ХҮЧИЙГ МЭДРЭЭРЭЙ',
      btn: 'SHOP NOW',
    },
    {
      image: '/banners/hero-3.jpg',
      subtitle: 'Хамгийн их борлуулалттай',
      title: 'Өдөр тутмын арчилгааны багц.',
      desc: 'ХААНА Ч ЯВАА, ТАНЬ ДАГАЛДАНА',
      btn: 'SHOP NOW',
    },
  ];

  const nextSlide = () => setHeroSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    const handler = () => setCartOpen(prev => !prev);
    window.addEventListener('toggleCart', handler);
    return () => window.removeEventListener('toggleCart', handler);
  }, []);

  let filteredProducts = products;
  if (activeCategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === activeCategory);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  }

  if (activeCategory === 'hair' && activeSubCategory !== 'all') {
    filteredProducts = filteredProducts.filter((p) => {
      const name = p.name.toLowerCase();
      if (activeSubCategory === 'shampoo') return name.includes('shampoo');
      if (activeSubCategory === 'conditioner') return name.includes('conditioner') || name.includes('detangler');
      if (activeSubCategory === 'mask') return name.includes('mask');
      if (activeSubCategory === 'serum') return name.includes('serum');
      return true;
    });
  }

  if (activeCategory === 'body' && activeSubCategory !== 'all') {
    filteredProducts = filteredProducts.filter((p) => {
      const name = p.name.toLowerCase();
      if (activeSubCategory === 'wash') return name.includes('body wash') || name.includes('wash');
      if (activeSubCategory === 'lotion') return name.includes('lotion');
      if (activeSubCategory === 'scrub') return name.includes('scrub');
      if (activeSubCategory === 'oil') return name.includes('oil');
      return true;
    });
  }

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setActiveSubCategory('all');
    setSearchQuery('');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setActiveCategory('all');
    setActiveSubCategory('all');
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const categories = [
    { key: 'all', label: 'Бүгд' },
    { key: 'hair', label: 'Үс арчилгаа' },
    { key: 'body', label: 'Бие арчилгаа' },
    { key: 'lip', label: 'Уруул' },
    { key: 'set', label: 'Багц' },
  ];

  const hairSubCategories = [
    { key: 'all', label: 'Бүгд' },
    { key: 'shampoo', label: 'Шампунь' },
    { key: 'conditioner', label: 'Ангижруулагч' },
    { key: 'mask', label: 'Маск' },
    { key: 'serum', label: 'Серум' },
  ];

  const bodySubCategories = [
    { key: 'all', label: 'Бүгд' },
    { key: 'wash', label: 'Биеийн саван' },
    { key: 'lotion', label: 'Лосьон' },
    { key: 'scrub', label: 'Скраб' },
    { key: 'oil', label: 'Тос' },
  ];

  const currentSubCategories = activeCategory === 'hair'
    ? hairSubCategories
    : activeCategory === 'body'
      ? bodySubCategories
      : [];

  const faqs = [
    { q: 'Хүргэлт хэрхэн хийгддэг вэ?', a: 'Улаанбаатар хотод 24-48 цагийн дотор хүргэнэ.' },
    { q: 'Бүтээгдэхүүн жинхэнэ эсэхийг яаж мэдэх вэ?', a: 'Бид бүх бүтээгдэхүүнийг албан ёсны дистрибьютерээс шууд авдаг бөгөөд жинхэнэ гэдгийг баталгаажуулсан байдаг.' },
    { q: 'Төлбөрийн ямар хэлбэрүүд байдаг вэ?', a: 'Дансаар шилжүүлэг, QPay, SocialPay, болон бэлнээр хүргэлтийн үед төлөх боломжтой.' },
  ];

  return (
    <>
      <Header onSearch={handleSearch} />

      {/* 1. Hero Banner Slider */}
      <section className="hero-banner">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`hero-slide ${i === heroSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-slide-overlay" />
            <div className="hero-slide-content">
              <p className="hero-slide-subtitle">
                <span className="stars-hero">★★★★★</span> {slide.subtitle}
              </p>
              <h1 className="hero-slide-title">{slide.title}</h1>
              <p className="hero-slide-desc">{slide.desc}</p>
              <a href="#products" className="hero-slide-btn">{slide.btn}</a>
            </div>
          </div>
        ))}
        <button className="hero-arrow hero-arrow-left" onClick={prevSlide}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={nextSlide}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === heroSlide ? 'active' : ''}`}
              onClick={() => setHeroSlide(i)}
            />
          ))}
        </div>
      </section>

      {/* 2. Best Sellers Carousel */}
      <section className="bestsellers-section fade-section">
        <div className="container">
          <h2 className="section-title-center">Хамгийн их борлуулалттай</h2>
        </div>
        {productsLoaded ? (
          <ProductCarousel products={products.slice(0, 8)} />
        ) : (
          <div className="products-loading-row">
            {[...Array(4)].map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        )}
      </section>

      {/* 3. Brand Values — IT'S ALL GOOD */}
      <section className="brand-values-section fade-section">
        <div className="container">
          <p className="bv-subtitle">IT&apos;S ALL GOOD</p>
          <h2 className="bv-title">Цэвэр, байгалийн, өдөр тутмын<br/>арчилгаа — жинхэнэ үр дүнтэй.</h2>
          <div className="bv-grid">
            <div className="bv-item">
              <div className="bv-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M24 4C18 4 14 10 14 16c0 8 10 18 10 18s10-10 10-18c0-6-4-12-10-12z"/><circle cx="24" cy="16" r="4"/><path d="M10 38c0-4 6-7 14-7s14 3 14 7"/></svg>
              </div>
              <span className="bv-label">Байгалийн гаралтай органик<br/>БҮТЭЭГДЭХҮҮН</span>
            </div>
            <div className="bv-item">
              <div className="bv-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8c-4 2-6 8-4 14s8 12 12 14c4-2 10-8 12-14s0-12-4-14"/><path d="M24 12v24"/><path d="M18 20c2-2 4-3 6-3s4 1 6 3"/></svg>
              </div>
              <span className="bv-label">БАЙГАЛЬД<br/>ЭЭЛТЭЙ</span>
            </div>
            <div className="bv-item">
              <div className="bv-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="14" width="32" height="24" rx="3"/><path d="M8 22h32"/><path d="M16 30h8"/></svg>
              </div>
              <span className="bv-label">ХЯЛБАР<br/>ТӨЛБӨР</span>
            </div>
            <div className="bv-item">
              <div className="bv-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 24c0-8 5.4-14 12-14s12 6 12 14"/><path d="M8 24h32"/><path d="M18 32c0 2 2.7 4 6 4s6-2 6-4"/><path d="M20 18c1-2 2.5-3 4-3s3 1 4 3"/></svg>
              </div>
              <span className="bv-label">БҮХ ТӨРЛИЙН<br/>ҮСЭНД</span>
            </div>
            <div className="bv-item">
              <div className="bv-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 36V16l16-8 16 8v20l-16 8z"/><path d="M24 8v36"/><path d="M8 16l16 8 16-8"/></svg>
              </div>
              <span className="bv-label">ХУРДАН<br/>ХҮРГЭЛТ</span>
            </div>
            <div className="bv-item">
              <div className="bv-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M24 4l6 12 13 2-9.5 9 2.5 13L24 34l-12 6 2.5-13L5 18l13-2z"/></svg>
              </div>
              <span className="bv-label">ДЭЭД ЗЭРГИЙН<br/>ЧАНАР</span>
            </div>
          </div>
          <a href="#products" className="bv-btn">ДЭЛГЭРЭНГҮЙ</a>
        </div>
      </section>

      {/* 6. All Products */}
      <section className="products-section" id="products">
        <div className="container">
          {/* CA Naturals style category nav */}
          <div className="collection-nav">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`collection-nav-item ${activeCategory === cat.key ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {currentSubCategories.length > 0 && (
            <div className="subcat-nav">
              {currentSubCategories.map((sub) => (
                <button
                  key={sub.key}
                  className={`subcat-btn ${activeSubCategory === sub.key ? 'active' : ''}`}
                  onClick={() => setActiveSubCategory(sub.key)}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {!productsLoaded ? (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="product-skeleton" />)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <p className="no-results">Хайлтад тохирох бүтээгдэхүүн олдсонгүй.</p>
          )}
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="faq-section fade-section">
        <div className="container">
          <h2 className="faq-title">Түгээмэл асуултууд</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div className="faq-item" key={i}>
                <button
                  className={`faq-question ${openFaq === i ? 'open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <span>+</span>
                </button>
                <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <Toast />
    </>
  );
}
