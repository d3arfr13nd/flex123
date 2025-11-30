import React from 'react';
import { Card, Breadcrumb, Typography, Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface PageContainerProps {
  title: string;
  breadcrumb?: Array<{ label: string; path?: string }>;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  breadcrumb,
  extra,
  children,
}) => {
  const breadcrumbItems = [
    {
      title: (
        <a href="/">
          <HomeOutlined /> Home
        </a>
      ),
    },
    ...(breadcrumb?.map((item) => ({
      title: item.path ? <a href={item.path}>{item.label}</a> : item.label,
    })) || []),
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        {breadcrumb && breadcrumb.length > 0 && (
          <Breadcrumb items={breadcrumbItems} />
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={2} style={{ margin: 0, color: '#1F1F1F' }}>
            {title}
          </Title>
          {extra && <div>{extra}</div>}
        </div>
      </Space>
      {children}
    </div>
  );
};

