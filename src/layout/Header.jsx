import React, { useEffect } from 'react';
import { Layout, Menu, Avatar, Badge, Button, message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../assets/images/logo.jpg";
import { LogoutOutlined, LoginOutlined } from '@ant-design/icons';
const { Header } = Layout;
import './Header.css';

const ROLE_MENUS = {
  1: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'health-records', label: 'Hồ sơ sức khỏe', path: '/health-records' },
    { key: 'medications', label: 'Gửi thuốc', path: '/medications' },
    { key: 'health-check', label: 'Kiểm tra sức khỏe', path: '/health-check' },
    { key: 'vaccination', label: 'Tiêm chủng', path: '/vaccination' },
  ],
  2: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'manage-medication', label: 'Quản lí thuốc', path: '/manage-medication' },
    { key: 'medical-events', label: 'Sự kiện y tế ', path: '/medical-events' },
    { key: 'manage-vaccination', label: 'Tiêm Chủng', path: '/manage-vaccination' },
    { key: 'manage-health-check', label: 'Kiểm tra y tế', path: '/manage-health-check' },
  ],
  3: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'user-management', label: 'Quản Lý Người Dùng', path: '/manager-users' },
    { key: 'supplies-management', label: 'Quản Lý Vật Tư', path: '/manager-supply' },
    { key: 'manage-dashboard', label: 'Biểu Đồ Báo Cáo', path: '/manager-dashboard' },
    { key: 'manager-event', label: 'Quản Lý Sự Kiện', path: '/manager-event' },
  ]
};

const getMenuByRole = (role) => {
  const numericRole = Number(role);
  if (!ROLE_MENUS[numericRole]) {
    console.warn(`Invalid role: ${role}, defaulting to PARENT menu`);
    return ROLE_MENUS[1];
  }
  return ROLE_MENUS[numericRole];
};

const HeaderLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const role = Number(localStorage.getItem('role')) || 1;
  const menuItems = getMenuByRole(role);
  const userName = localStorage.getItem('email') || 'Người dùng';
  const fullName = localStorage.getItem('fullname');


  const handleLogout = () => {
    localStorage.clear();
    message.success('Đăng xuất thành công!');
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    if (role === 2 || role === 3) {
      document.body.classList.add("nurse-admin-layout");
    } else {
      document.body.classList.remove("nurse-admin-layout");
    }
    return () => {
      document.body.classList.remove("nurse-admin-layout");
    };
  }, [role]);

  return (
    <Header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img src={Logo} alt="Logo" className="logo-image" />
          <span className="logo-text">Y tế Học đường</span>
        </div>

        <Menu

          mode={role === 2 || role === 3 ? "vertical" : "horizontal"}

          selectedKeys={[
            menuItems.find(item => location.pathname.startsWith(item.path))?.path || '/'
          ]}
          className={`nav-menu${role === 2 || role === 3 ? " vertical-menu" : ""}`}

          items={menuItems.map(item => ({
            key: item.path,
            label: <Link to={item.path}>{item.label}</Link>
          }))}
        />


        <div className="user-controls">
          {isAuthenticated ? (
            <>
              <div className="welcome-message">
                {fullName ? `Xin chào, ${fullName}` : `Xin chào, ${userName}`}
              </div>
              <div className="user-info">
                <Avatar size="small" className="user-avatar">
                  {(fullName && fullName[0]) ? fullName[0].toUpperCase() : (userName ? (userName.split('@')[0][0]?.toUpperCase() || 'U') : 'U')}
                </Avatar>
                <span className="username">{fullName || userName}</span>
              </div>
              <Button
                type="link"
                icon={<LogoutOutlined />}
                className="logout-button"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </Header>
  );
};

export default HeaderLayout;