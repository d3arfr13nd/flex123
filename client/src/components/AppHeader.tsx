import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

const { Header } = Layout;
const { Text } = Typography;

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const user = authStore((state) => state.user);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid #F0F0F0',
      }}
    >
      <div
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1677FF',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/rooms')}
      >
        FlexSpace
      </div>
      <Space>
        <Text style={{ color: '#595959' }}>{user?.name}</Text>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Avatar
            style={{ backgroundColor: '#1677FF', cursor: 'pointer' }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

