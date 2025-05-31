// src/components/layout/Footer.jsx
import React from 'react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer className="site-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/about">Giới thiệu</Link>
            <Link to="/contact">Liên hệ</Link>
            <Link to="/privacy">Chính sách bảo mật</Link>
          </div>
          <div className="footer-copyright">
            <p>© 2025 Hệ thống Y tế Học đường. All rights reserved.</p>
          </div>
        </div>
      </Footer>
  );
};

export default AppFooter;
