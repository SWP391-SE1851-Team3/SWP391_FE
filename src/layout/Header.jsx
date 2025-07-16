import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Badge, Button, message, Tooltip } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../assets/images/logo.jpg";
import { 
  LogoutOutlined, 
  LoginOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  SafetyOutlined,
  UserOutlined,
  SettingOutlined,
  CalendarOutlined,
  TeamOutlined
} from '@ant-design/icons';

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
    { key: 'home', label: 'Trang chủ', path: '/', icon: <HomeOutlined /> },
    { key: 'manage-medication', label: 'Quản lí thuốc', path: '/manage-medication', icon: <MedicineBoxOutlined /> },
    { key: 'medical-events', label: 'Sự kiện y tế', path: '/medical-events', icon: <CalendarOutlined /> },
    { key: 'manage-vaccination', label: 'Tiêm Chủng', path: '/manage-vaccination', icon: <SafetyOutlined /> },
    { key: 'manage-health-check', label: 'Kiểm tra y tế', path: '/manage-health-check', icon: <HeartOutlined /> },
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
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempExpanded, setTempExpanded] = useState(false);
  
  const isAuthenticated = localStorage.getItem('token');
  const role = Number(localStorage.getItem('role')) || 1;
  const menuItems = getMenuByRole(role);
  
  const getCurrentSelectedKey = () => {
    const currentPathname = location.pathname;
    
    if (currentPathname === '/') {
      return '/';
    }
    
    const sortedMenuItems = [...menuItems].sort((a, b) => b.path.length - a.path.length);
    
    for (const item of sortedMenuItems) {
      if (item.path !== '/' && currentPathname.startsWith(item.path)) {
        return item.path;
      }
    }
    
    return '/';
  };

  const selectedKey = getCurrentSelectedKey();
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

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    setTempExpanded(false);
  };

  const handleMenuMouseEnter = () => {
    if (collapsed) {
      setIsHovered(true);
      setTempExpanded(true);
    }
  };

  const handleMenuMouseLeave = () => {
    setIsHovered(false);
    setTempExpanded(false);
  };

  const isMenuExpanded = !collapsed || tempExpanded;

  useEffect(() => {
    if (role === 2 || role === 3) {
      document.body.classList.add("nurse-admin-layout");
      
      if (isMenuExpanded) {
        document.body.classList.remove("menu-collapsed");
        document.body.classList.add("menu-expanded");
      } else {
        document.body.classList.add("menu-collapsed");
        document.body.classList.remove("menu-expanded");
      }
      
      if (tempExpanded) {
        document.body.classList.add("menu-temp-expanded");
      } else {
        document.body.classList.remove("menu-temp-expanded");
      }
    } else {
      document.body.classList.remove("nurse-admin-layout", "menu-collapsed", "menu-expanded", "menu-temp-expanded");
    }
    
    setTimeout(() => {
      const siteContent = document.querySelector('.site-content');
      const contentWrapper = document.querySelector('.content-wrapper');
      if (siteContent) {
        siteContent.style.transform = 'translateX(0)';
      }
      if (contentWrapper) {
        contentWrapper.style.width = '100%';
      }
    }, 50);
    
    return () => {
      document.body.classList.remove("nurse-admin-layout", "menu-collapsed", "menu-expanded", "menu-temp-expanded");
    };
  }, [role, collapsed, tempExpanded, isMenuExpanded]);

  const isVerticalMenu = role === 2 || role === 3;

  return (
    <>
      <Header className="header">
        <div className="header-container">
          <div className="logo-section">
            <img src={Logo} alt="Logo" className="logo-image" />
            <span className="logo-text">Y tế Học đường</span>
          </div>

          <div 
            className={`menu-container ${isVerticalMenu ? 'vertical-container' : 'horizontal-container'}`}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
            <Menu
              mode={isVerticalMenu ? "vertical" : "horizontal"}
              selectedKeys={[selectedKey]}
              className={`nav-menu${isVerticalMenu ? " vertical-menu" : " horizontal-menu"} ${collapsed ? " collapsed-menu" : ""} ${tempExpanded ? " temp-expanded" : ""}`}
              // Disable overflow behavior completely
              overflowedIndicator={false}
              style={{ 
                border: 'none', 
                background: 'transparent',
                display: 'flex',
                width: '100%'
              }}
              items={menuItems.map(item => ({
                key: item.path,
                icon: isVerticalMenu ? item.icon : undefined, // Only icons for vertical menu
                label: <Link to={item.path}>{item.label}</Link>,
                title: (isVerticalMenu && collapsed && !isHovered) ? item.label : undefined,
                style: isVerticalMenu ? {} : { 
                  flex: 1, 
                  justifyContent: 'center',
                  textAlign: 'center'
                }
              }))}
            />
          </div>

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
                <Tooltip title="Đăng xuất" placement="bottom">
                  <Button
                    type="link"
                    icon={<LogoutOutlined />}
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </Button>
                </Tooltip>
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

      {isVerticalMenu && (
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className="collapse-button"
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        />
      )}
    </>
  );
};

export default HeaderLayout;