import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../assets/images/logo.jpg";
import { BellOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { Menu, Avatar, Badge, Button, message } from 'antd';
import { useVaccination } from '../context/VaccinationContext';
const { Header } = Layout;
import './Header.css';

const ROLE_MENUS = {
  PARENT: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'health-records', label: 'Hồ sơ sức khỏe', path: '/health-records' },
    { key: 'medications', label: 'Gửi thuốc', path: '/medications' },
    { key: 'health-check', label: 'Kiểm tra sức khỏe', path: '/health-check' },
    { key: 'vaccination', label: 'Tiêm chủng', path: '/vaccination' },
  ],
  NURSE: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'manage-medication', label: 'Quản lí thuốc', path: '/manage-medication' },
    { key: 'medical-events', label: 'Sự kiện y tế ', path: '/medical-events' },
    { key: 'manage-vaccination', label: 'Tiêm Chủng', path: '/manage-vaccination' },
    { key: 'manage-health-check', label: 'Kiểm tra y tế', path: '/manage-health-check' },
  ],
  ADMIN: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'user-management', label: 'Quản lý người dùng', path: '/users' },
    { key: 'school-management', label: 'Quản lý trường học', path: '/schools' },
    { key: 'system-settings', label: 'Cài đặt hệ thống', path: '/settings' },
  ]
};

const getMenuByRole = (roleString) => {
  if (!ROLE_MENUS[roleString]) {
    console.warn(`Invalid role: ${roleString}, defaulting to PARENT menu`);
    return ROLE_MENUS.PARENT;
  }
  return ROLE_MENUS[roleString];
};

const HeaderLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const roleString = localStorage.getItem('roleString') || 'PARENT';
  const menuItems = getMenuByRole(roleString);
  const userName = localStorage.getItem('email') || 'Người dùng';
  const { newVaccinationCount } = useVaccination();

  const handleLogout = () => {
    localStorage.clear();
    message.success('Đăng xuất thành công!');
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    if (["NURSE", "ADMIN"].includes(roleString)) {
      document.body.classList.add("nurse-admin-layout");
    } else {
      document.body.classList.remove("nurse-admin-layout");
    }
    return () => {
      document.body.classList.remove("nurse-admin-layout");
    };
  }, [roleString]);

  return (
    <Header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img src={Logo} alt="Logo" className="logo-image" />
          <span className="logo-text">Y tế Học đường</span>
        </div>

        <Menu
          mode={["NURSE", "ADMIN"].includes(roleString) ? "vertical" : "horizontal"}
          selectedKeys={[location.pathname]}
          className={`nav-menu${["NURSE", "ADMIN"].includes(roleString) ? " vertical-menu" : ""}`}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.path}>
              <Link to={item.path}>
                {item.label}
                {item.key === 'vaccination' && newVaccinationCount > 0 && (
                  <Badge dot style={{ marginLeft: 6, backgroundColor: 'red' }} />
                )}
              </Link>
            </Menu.Item>
          ))}
        </Menu>

        <div className="user-controls">
          {isAuthenticated ? (
            <>
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
