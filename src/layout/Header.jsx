import React from 'react';
import { Layout } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../assets/images/logo.jpg";
import { BellOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { Menu, Avatar, Badge, Button, message } from 'antd';
const { Header } = Layout;
import './Header.css';

const ROLE_MENUS = {
  PARENT: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'health-records', label: 'Hồ sơ sức khỏe', path: '/health-records' },
    { key: 'medications', label: 'Gửi thuốc', path: '/medications' },
    { key: 'health-check', label: 'Kiểm tra sức khỏe', path: '/health-check' },
    { key: 'vaccination', label: 'Tiêm chủng', path: '/vaccination' },
    { key: 'dashboard', label: 'Báo cáo', path: '/dashboard' },
  ],
  NURSE: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'student-list', label: 'Danh sách học sinh', path: '/students' },
    { key: 'health-management', label: 'Quản lý sức khỏe', path: '/health-management' },
    { key: 'medicine-approval', label: 'Duyệt thuốc', path: '/medicine-approval' },
  ],
  ADMIN: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'user-management', label: 'Quản lý người dùng', path: '/users' },
    { key: 'school-management', label: 'Quản lý trường học', path: '/schools' },
    { key: 'system-settings', label: 'Cài đặt hệ thống', path: '/settings' },
  ]
};

const HeaderLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || 'PARENT';
  const userName = localStorage.getItem('email') || 'Người dùng';
  const menuItems = ROLE_MENUS[userRole];

  const handleLogout = () => {
    localStorage.clear();
    message.success('Đăng xuất thành công!');
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img src={Logo} alt="Logo" className="logo-image" />
          <span className="logo-text">Y tế Học đường</span>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          className="nav-menu"
        >
          {menuItems.map(item => (
            <Menu.Item key={item.path}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>

        <div className="user-controls">
          {isAuthenticated ? (
            <>
              <Badge count={0} className="notification-badge">
                <BellOutlined className="notification-icon" />
              </Badge>
              <div className="user-info">
                <Avatar size="small" className="user-avatar">
                  {userName[0]}
                </Avatar>
                <span className="username">{userName}</span>
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
