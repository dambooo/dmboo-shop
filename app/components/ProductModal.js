'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/products';
import { useShop } from '@/lib/ShopContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useShop();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <>
      <div className="modal-overlay open" onClick={onClose}></div>
      <div className="modal open">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">
          <div className="modal-image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="modal-info">
            <div className="modal-breadcrumb">
              Бүгд <span>/</span> {product.category === 'shampoo' ? 'Шампунь' : product.category === 'conditioner' ? 'Кондиционер' : product.category === 'mask' ? 'Маск' : product.category === 'oil' ? 'Тос' : 'Багц'}
            </div>
            <h2>{product.name}</h2>
            <div className="modal-price">{formatPrice(product.price)}</div>
            {product.oldPrice && (
              <div className="modal-old-price">{formatPrice(product.oldPrice)}</div>
            )}
            <p className="modal-desc">{product.desc}</p>
            <div className="modal-code">Бүтээгдэхүүний код : {String(product.id).padStart(6, '0')}</div>
            <div className="modal-quantity">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <div className="modal-shipping">🚚 Хүргэлттэй</div>
            <div className="modal-actions">
              <button className="modal-cart-btn" onClick={() => { addToCart(product.id, qty); onClose(); }}>
                🛒 Сагслах
              </button>
              <button className="modal-order-btn" onClick={() => { addToCart(product.id, qty); onClose(); window.dispatchEvent(new Event('toggleCart')); }}>
                Захиалах
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
