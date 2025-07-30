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
  TeamOutlined,
  FileTextOutlined,
  AlertOutlined
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
    { key: 'medical-accident', label: 'Sự Kiện Y Tế', path: '/medical-accident' },
  ],
  2: [
    { key: 'home', label: 'Trang chủ', path: '/', icon: <HomeOutlined /> },
    { key: 'manage-medication', label: 'Quản lí thuốc', path: '/manage-medication', icon: <MedicineBoxOutlined /> },
    { key: 'medical-events', label: 'Sự kiện y tế', path: '/medical-events', icon: <CalendarOutlined /> },
    { key: 'manage-vaccination', label: 'Tiêm Chủng', path: '/manage-vaccination', icon: <SafetyOutlined /> },
    { key: 'manage-health-check', label: 'Kiểm tra y tế', path: '/manage-health-check', icon: <HeartOutlined /> },
  ],
  3: [
    { key: 'home', label: 'Trang chủ', path: '/', icon: <HomeOutlined /> },
    { key: 'user-management', label: 'Quản Lý Người Dùng', path: '/manager-users', icon: <TeamOutlined /> },
    { key: 'supplies-management', label: 'Quản Lý Vật Tư', path: '/manager-supply', icon: <MedicineBoxOutlined /> },
    { key: 'manage-dashboard', label: 'Biểu Đồ Báo Cáo', path: '/manager-dashboard', icon: <CalendarOutlined /> },
    { key: 'manager-event', label: 'Quản Lý Sự Kiện', path: '/manager-event', icon: <AlertOutlined /> },
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

// Thêm hàm chuyển đổi role thành tên vai trò
const getRoleName = (role) => {
  switch (Number(role)) {
    case 1:
      return 'Phụ huynh';
    case 2:
      return 'Y tá';
    case 3:
      return 'Quản lý';
    default:
      return 'Người dùng';
  }
};

const HeaderLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [tempExpanded, setTempExpanded] = useState(false);
  
  const isAuthenticated = localStorage.getItem('token');
  const role = Number(localStorage.getItem('role')) || 1;
  const roleName = getRoleName(role);
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
            <span className="logo-text">Y Tế Học Đường</span>
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
              style={{ 
                border: 'none', 
                background: 'transparent',
                width: '100%',
                lineHeight: '64px'
              }}
              items={menuItems.map((item) => ({
                key: item.path,
                icon: isVerticalMenu ? item.icon : undefined,
                label: <Link to={item.path}>{item.label}</Link>,
                title: (isVerticalMenu && collapsed && !isHovered) ? item.label : undefined,
                style: isVerticalMenu ? {} : {
                  flex: '1',
                  textAlign: 'center',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }))}
            />
          </div>

          <div className="user-controls">
            {isAuthenticated ? (
              <>
                <div className="welcome-message">
                  {fullName ? `Xin chào, ${roleName} ${fullName}` : `Xin chào, ${roleName} ${userName}`}
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