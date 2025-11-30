import React, { useState } from 'react';
import { Row, Col, Card, Button, Input, Select, InputNumber, Space, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRooms } from '../../hooks/useRooms';
import { RoomCard } from '../../components/RoomCard';
import { PageContainer } from '../../components/PageContainer';
import { MainLayout } from '../layout/MainLayout';
import { RoomFormDrawer } from './RoomFormDrawer';
import { RoomType } from '../../api/roomsApi';
import { authStore } from '../../store/authStore';

const { Search } = Input;

export const RoomsListPage: React.FC = () => {
  const user = authStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';
  const [filters, setFilters] = useState<{
    type?: RoomType;
    minCapacity?: number;
    maxCapacity?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: rooms, isLoading } = useRooms(filters);

  return (
    <MainLayout>
      <PageContainer
        title="Rooms & Spaces"
        breadcrumb={[{ label: 'Rooms' }]}
        extra={
          isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDrawerOpen(true)}
            >
              Add Room
            </Button>
          )
        }
      >
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Room Type"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={(value) => setFilters({ ...filters, type: value })}
                  options={[
                    { label: 'Desk', value: 'desk' },
                    { label: 'VIP', value: 'vip' },
                    { label: 'Meeting', value: 'meeting' },
                    { label: 'Conference', value: 'conference' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <InputNumber
                  placeholder="Min Capacity"
                  style={{ width: '100%' }}
                  min={1}
                  onChange={(value) => setFilters({ ...filters, minCapacity: value || undefined })}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <InputNumber
                  placeholder="Max Capacity"
                  style={{ width: '100%' }}
                  min={1}
                  onChange={(value) => setFilters({ ...filters, maxCapacity: value || undefined })}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Search
                  placeholder="Search rooms"
                  allowClear
                  onSearch={(value) => setFilters({ ...filters, search: value || undefined })}
                />
              </Col>
            </Row>
          </Space>
        </Card>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
          </div>
        ) : rooms && rooms.length > 0 ? (
          <Row gutter={[16, 16]}>
            {rooms.map((room) => (
              <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
                <RoomCard room={room} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No rooms found" />
        )}

        {drawerOpen && (
          <RoomFormDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </PageContainer>
    </MainLayout>
  );
};

