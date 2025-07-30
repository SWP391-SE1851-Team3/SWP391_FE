import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';
import Header from "./Header";
import Footer from "./Footer";

const { Content } = Layout;

const MainLayout = () => {
  useEffect(() => {
    const handleResize = () => {
      const contentWrapper = document.querySelector('.content-wrapper');
      if (contentWrapper) {
        contentWrapper.style.width = '100%';
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Layout className="main-layout">
      <Header />
      <Content className="site-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default MainLayout;
