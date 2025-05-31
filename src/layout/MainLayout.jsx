import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';
import Header from "./Header";
import Footer from "./Footer";

const {Content} = Layout;

const MainLayout = () => {
  return (
    <Layout className="main-layout">
      <Header/>
      <Content className="site-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </Content>
      <Footer/>
    </Layout>
  );
};

export default MainLayout;
