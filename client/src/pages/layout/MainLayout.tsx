import React from 'react';
import { Layout } from 'antd';
import { AppHeader } from '../../components/AppHeader';
import { AppSidebar } from '../../components/AppSidebar';
import { uiStore } from '../../store/uiStore';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const collapsed = uiStore((state) => state.sidebarCollapsed);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSidebar />
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 200,
            transition: 'margin-left 0.2s',
          }}
        >
          <Content
            style={{
              margin: 0,
              padding: 0,
              background: '#F5F5F5',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

