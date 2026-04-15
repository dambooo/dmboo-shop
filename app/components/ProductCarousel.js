'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/products';
import { useShop } from '@/lib/ShopContext';

export default function ProductCarousel({ products }) {
  const { addToCart } = useShop();
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);

  const activeProduct = products[activeIndex];

  const goTo = (index) => {
    if (index < 0) index = products.length - 1;
    if (index >= products.length) index = 0;
    setActiveIndex(index);
  };

  useEffect(() => {
    if (trackRef.current) {
      const track = trackRef.current;
      const cards = track.children;
      if (cards[activeIndex]) {
        const card = cards[activeIndex];
        const trackWidth = track.offsetWidth;
        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const scrollPos = cardLeft - (trackWidth / 2) + (cardWidth / 2);
        track.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  if (!products.length || !activeProduct) return null;

  return (
    <div className="carousel-section">
      <div className="carousel-wrapper">
        <button className="carousel-arrow carousel-arrow-left" onClick={() => goTo(activeIndex - 1)}>
          ←
        </button>

        <div className="carousel-track" ref={trackRef}>
          {products.map((product, i) => (
            <div
              key={product.id}
              className={`carousel-slide ${i === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              <img src={product.image} alt={product.name} loading="lazy" />
            </div>
          ))}
        </div>

        <button className="carousel-arrow carousel-arrow-right" onClick={() => goTo(activeIndex + 1)}>
          →
        </button>
      </div>

      <div className="carousel-info">
        <Link href={`/products/${activeProduct.id}`} className="carousel-product-name">
          {activeProduct.name}
        </Link>
        <p className="carousel-product-desc">{activeProduct.desc}</p>
        <div className="carousel-rating">
          <span className="stars">
            {'★'.repeat(Math.floor(activeProduct.rating || 4))}
            {(activeProduct.rating || 4) % 1 >= 0.5 ? '½' : ''}
          </span>
          <span className="rating-count">({activeProduct.reviews || 0})</span>
        </div>
        <button
          className="carousel-add-btn"
          onClick={() => addToCart(activeProduct.id)}
        >
          САГСЛАХ — {formatPrice(activeProduct.price)}
        </button>
      </div>
    </div>
  );
}
