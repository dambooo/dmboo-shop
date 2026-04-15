'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useShop } from '@/lib/ShopContext';

export default function Header({ onSearch }) {
  const { cartCount } = useShop();

  return (
    <>
      <div className="top-bar">
        Үнэгүй хүргэлт — 40,000₮-с дээш захиалгад · 24-48 цагт хүргэнэ
      </div>
      <header className="header">
        <div className="container header-inner">
          <nav className="nav">
            <Link href="/" className="nav-link active">Нүүр</Link>
            <a href="#products" className="nav-link">Бүтээгдэхүүн</a>
            <a href="#about" className="nav-link">Тухай</a>
          </nav>
          <Link href="/" className="logo">GEZEG</Link>
          <div className="header-actions">
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
              Сагс <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>
      <div className="marquee-bar">
        <div className="marquee-track">
          <span className="marquee-item"><span>★</span> 2000+ сэтгэл ханамжтай үйлчлүүлэгч</span>
          <span className="marquee-item"><span>✓</span> Албан ёсны борлуулагч</span>
          <span className="marquee-item"><span>🚚</span> Хурдан хүргэлт</span>
          <span className="marquee-item"><span>💯</span> 100% жинхэнэ бүтээгдэхүүн</span>
          <span className="marquee-item"><span>♻️</span> Байгальд ээлтэй</span>
          <span className="marquee-item"><span>★</span> 2000+ сэтгэл ханамжтай үйлчлүүлэгч</span>
          <span className="marquee-item"><span>✓</span> Албан ёсны борлуулагч</span>
          <span className="marquee-item"><span>🚚</span> Хурдан хүргэлт</span>
          <span className="marquee-item"><span>💯</span> 100% жинхэнэ бүтээгдэхүүн</span>
          <span className="marquee-item"><span>♻️</span> Байгальд ээлтэй</span>
        </div>
      </div>
    </>
  );
}
