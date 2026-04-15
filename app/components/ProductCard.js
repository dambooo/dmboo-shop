'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/products';
import { useShop } from '@/lib/ShopContext';

export default function ProductCard({ product }) {
  const { addToCart } = useShop();

  const badgeClass = product.badge === 'sale' ? 'badge-sale' : product.badge === 'new' ? 'badge-new' : 'badge-hot';
  const badgeText = product.badge === 'sale' ? `-${product.discount}%` : product.badge === 'new' ? 'Шинэ' : 'Эрэлттэй';

  return (
    <div className="product-card">
      <Link href={`/products/${product.id}`} className="product-card-link">
        <div className="product-image">
          <img src={product.image} alt={product.name} loading="lazy" className="product-img-main" />
          {product.hoverImage && (
            <img src={product.hoverImage} alt={product.name} loading="lazy" className="product-img-hover" />
          )}
          {product.badge && <span className={`badge ${badgeClass}`}>{badgeText}</span>}
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-desc">{product.desc}</div>
          {product.rating && (
            <div className="product-rating">
              <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
              <span className="rating-count">({product.reviews || 0})</span>
            </div>
          )}
        </div>
      </Link>
      <div className="product-info">
        <button className="add-to-cart" onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}>
          Сагслах — {formatPrice(product.price)}
        </button>
      </div>
    </div>
  );
}
