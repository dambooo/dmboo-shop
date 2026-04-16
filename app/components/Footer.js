'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Grid */}
        <div className="footer-top">
          <div className="footer-col-brand">
            <div className="footer-brand">GEZEG</div>
            <p className="footer-brand-desc">Чанартай, байгальд ээлтэй, өдөр тутмын арчилгааны бүтээгдэхүүнүүдийг албан ёсоор борлуулна.</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/gezegstore/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4>Бүтээгдэхүүн</h4>
            <a href="#products">Шампунь</a>
            <a href="#products">Кондиционер</a>
            <a href="#products">Маск</a>
            <a href="#products">Тос</a>
            <a href="#products">Багц</a>
          </div>
          <div>
            <h4>Мэдээлэл</h4>
            <a href="#">Бидний тухай</a>
            <a href="#">Хүргэлтийн нөхцөл</a>
            <a href="#">Төлбөрийн нөхцөл</a>
            <a href="#">Нууцлалын бодлого</a>
          </div>
          <div>
            <h4>Холбоо барих</h4>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>88120583</span>
              </div>
              <div className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>info@gezegstore.com</span>
              </div>
              <div className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Улаанбаатар, Монгол</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="footer-payments">
          <span className="footer-payments-label">Төлбөрийн хэлбэрүүд:</span>
          <div className="footer-payment-icons">
            <span className="payment-badge">QPay</span>
            <span className="payment-badge">SocialPay</span>
            <span className="payment-badge">Дансаар</span>
            <span className="payment-badge">Бэлнээр</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>&copy; 2026 GEZEG. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="footer-bottom-links">
            <a href="#">Нууцлал</a>
            <span>·</span>
            <a href="#">Үйлчилгээний нөхцөл</a>
            <span>·</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
