'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/products';
import { useShop } from '@/lib/ShopContext';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, cartTotal, clearCart, showToast } = useShop();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!/^[0-9]{8}$/.test(phone)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    const order = {
      id: Date.now(),
      phone: phone,
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      total: cartTotal,
      date: new Date().toLocaleString('mn-MN'),
      status: 'Шинэ'
    };

    const orders = JSON.parse(localStorage.getItem('mn_shop_orders') || '[]');
    orders.push(order);
    localStorage.setItem('mn_shop_orders', JSON.stringify(orders));

    onClose();
    clearCart();
    setPhone('');
    showToast('Захиалга амжилттай бүртгэгдлээ!');
  };

  return (
    <>
      <div className="modal-overlay open checkout-overlay-z" onClick={onClose}></div>
      <div className="modal open checkout-modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="checkout-content">
          <h2>Захиалга өгөх</h2>
          <div className="checkout-items">
            {cart.map(item => (
              <div className="checkout-item" key={item.id}>
                <span>{item.name} x{item.qty}</span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>Нийт дүн:</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <div className="checkout-form">
            <label htmlFor="checkoutPhone">Утасны дугаар *</label>
            <input
              type="tel"
              id="checkoutPhone"
              placeholder="Жишээ: 88120583"
              maxLength="8"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(false); }}
            />
            {phoneError && (
              <small style={{ color: '#e53935' }}>Зөв утасны дугаар оруулна уу (8 оронтой)</small>
            )}
          </div>
          <button className="checkout-submit-btn" onClick={handleSubmit}>
            Захиалга баталгаажуулах
          </button>
        </div>
      </div>
    </>
  );
}
