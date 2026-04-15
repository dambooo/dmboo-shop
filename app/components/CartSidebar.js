'use client';

import { useShop } from '@/lib/ShopContext';
import { formatPrice } from '@/lib/products';

export default function CartSidebar({ isOpen, onClose, onCheckout }) {
  const { cart, cartTotal, changeCartQty, removeFromCart } = useShop();

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Миний сагс</h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="cart-empty">Сагс хоосон байна</p>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                <img className="cart-item-img" src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{formatPrice(item.price * item.qty)}</div>
                  <div className="cart-item-controls">
                    <button onClick={() => changeCartQty(item.id, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => changeCartQty(item.id, 1)}>+</button>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Нийт дүн:</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>Захиалга өгөх</button>
          </div>
        )}
      </div>
    </>
  );
}
