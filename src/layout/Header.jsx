import React from 'react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import Logo from "../assets/images/logo.jpg";
import { BellOutlined, LogoutOutlined } from '@ant-design/icons';
import { Menu, Avatar, Badge, Button } from 'antd';
const { Header } = Layout;

// Define menu items for different roles
const ROLE_MENUS = {
  PARENT: [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'health-records', label: 'Hồ sơ sức khỏe', path: '/health-records' },
    { key: 'medications', label: 'Gửi thuốc', path: '/medications' },
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

const HeaderLayout = ({
  userName = 'Người dùng',
  badgeCount = 0,
  onLogout = () => {}
}) => {
  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole') || 'PARENT';
  const menuItems = ROLE_MENUS[userRole];

  return (
    <Header className="custom-header">
      <div className="header-left">
        <div className="logo">
          <img src={Logo} alt="Logo" />
          <span>Hệ thống Y tế Học đường</span>
        </div>
      </div>

      <div className="header-center">
        <Menu mode="horizontal" className="custom-nav">
          {menuItems.map(item => (
            <Menu.Item key={item.key}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      <div className="header-right">
        <div className="user-section">
          <Badge count={badgeCount} offset={[-5, 5]}>
            <BellOutlined className="notification-icon" />
          </Badge>
          <span className="user-name">Chào, {userName} ({userRole})</span>
          <Button 
            type="text"
            icon={<LogoutOutlined />} 
            className="logout-btn"
            onClick={onLogout}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </Header>
  );
};

export default HeaderLayout;
