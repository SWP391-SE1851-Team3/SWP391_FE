import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/about">Giới thiệu</a>
          <a href="/contact">Liên hệ</a>
          <a href="/privacy">Chính sách bảo mật</a>
          <a href="/terms">Điều khoản sử dụng</a>
        </div>
        <div className="footer-copyright">
          © 2024 Hệ thống Y tế Học đường. Bản quyền thuộc về Trường Đại học.
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
