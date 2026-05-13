'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useShop } from '@/lib/ShopContext';

export default function Header({ onSearch }) {
  const { cartCount } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      <div className="top-bar">
       Улаанбаатар хотод 24-48 цагийн дотор хүргэнэ.
      </div>
      <header className="header">
        <div className="container header-inner">
          {/* Desktop nav */}
          <nav className="nav">
            <Link href="/" className="nav-link active">Нүүр</Link>
            <a href="#products" className="nav-link">Бүтээгдэхүүн</a>
            <a href="#about" className="nav-link">Тухай</a>
          </nav>

          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Цэс">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <Link href="/" className="logo">GEZEG</Link>

          <div className="header-actions">
            {/* Mobile search toggle */}
            <button className="mobile-search-btn" onClick={() => setMobileSearchOpen(!mobileSearchOpen)} aria-label="Хайх">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            {/* Desktop search */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Хайх..."
                onChange={(e) => onSearch?.(e.target.value)}
              />
              <span className="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
            </div>
            <button className="cart-btn" onClick={() => {
              const event = new CustomEvent('toggleCart');
              window.dispatchEvent(event);
            }}>
              <span className="cart-btn-text">Сагс</span>
              <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="mobile-search-bar">
            <input
              type="text"
              placeholder="Бүтээгдэхүүн хайх..."
              autoFocus
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}
      </header>

      {/* Mobile side menu */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-logo">GEZEG</span>
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
        </div>
        <nav className="mobile-menu-nav">
          <Link href="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Нүүр</Link>
          <a href="#products" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Бүтээгдэхүүн</a>
          <a href="#about" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Бидний тухай</a>
        </nav>
        <div className="mobile-menu-footer">
          <a href="https://www.instagram.com/gezegstore/" target="_blank" rel="noopener noreferrer" className="mobile-menu-social">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
            @gezegstore
          </a>
          <p className="mobile-menu-phone">📞 88120583</p>
        </div>
      </div>

      <div className="marquee-bar">
        <div className="marquee-track">
          <span className="marquee-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Албан ёсны борлуулагч</span>
          <span className="marquee-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Хурдан хүргэлт</span>
          <span className="marquee-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Байгалийн гаралтай органик бүтээгдэхүүн</span>
          <span className="marquee-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c2-4 4-8 4-12a4 4 0 0 0-8 0c0 4 2 8 4 12z"/><path d="M8 2s-2 4-2 8a6 6 0 0 0 4 5.5"/><path d="M16 2s2 4 2 8a6 6 0 0 1-4 5.5"/></svg> Байгальд ээлтэй</span>
          <span className="marquee-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Албан ёсны борлуулагч</span>
          <span className="marquee-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Хурдан хүргэлт</span>
          <span className="marquee-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Байгалийн гаралтай органик бүтээгдэхүүн</span>
          <span className="marquee-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c2-4 4-8 4-12a4 4 0 0 0-8 0c0 4 2 8 4 12z"/><path d="M8 2s-2 4-2 8a6 6 0 0 0 4 5.5"/><path d="M16 2s2 4 2 8a6 6 0 0 1-4 5.5"/></svg> Байгальд ээлтэй</span>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        <Link href="/" className="mobile-bottom-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Нүүр</span>
        </Link>
        <a href="#products" className="mobile-bottom-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>Бүтээгдэхүүн</span>
        </a>
        <button className="mobile-bottom-item" onClick={() => {
          const event = new CustomEvent('toggleCart');
          window.dispatchEvent(event);
        }}>
          <div className="mobile-bottom-cart-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {cartCount > 0 && <span className="mobile-bottom-badge">{cartCount}</span>}
          </div>
          <span>Сагс</span>
        </button>
      </nav>
    </>
  );
}
