import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { authStore } from '../store/authStore';
import { uiStore } from '../store/uiStore';

const { Sider } = Layout;

export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authStore((state) => state.user);
  const collapsed = uiStore((state) => state.sidebarCollapsed);

  const menuItems = [
    {
      key: '/rooms',
      icon: <AppstoreOutlined />,
      label: 'Rooms',
    },
    {
      key: '/bookings/my',
      icon: <CalendarOutlined />,
      label: 'My Bookings',
    },
    ...(user?.role === 'Admin'
      ? [
          {
            key: '/bookings',
            icon: <CalendarOutlined />,
            label: 'All Bookings',
          },
          {
            key: '/users',
            icon: <UserOutlined />,
            label: 'Users',
          },
        ]
      : []),
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(collapsed) => {
        uiStore.getState().setSidebarCollapsed(collapsed);
      }}
      width={200}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 64,
        background: '#FFFFFF',
        borderRight: '1px solid #F0F0F0',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          height: '100%',
          borderRight: 0,
          marginTop: 16,
        }}
      />
    </Sider>
  );
};

