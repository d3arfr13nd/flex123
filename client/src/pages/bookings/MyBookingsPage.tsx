import React from 'react';
import { Table, Card, Tag, Button, Popconfirm, Space, Empty, Spin } from 'antd';
import { CalendarOutlined, CloseOutlined } from '@ant-design/icons';
import { useMyBookings, useCancelBooking } from '../../hooks/useBookings';
import { PageContainer } from '../../components/PageContainer';
import { MainLayout } from '../layout/MainLayout';
import { Booking } from '../../api/bookingsApi';
import dayjs from 'dayjs';

export const MyBookingsPage: React.FC = () => {
  const { data: bookings, isLoading } = useMyBookings();
  const cancelBooking = useCancelBooking();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'cyan',
      paid: 'green',
      cancelled: 'red',
      done: 'default',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
      render: (room: Booking['room']) => room?.name || 'N/A',
    },
    {
      title: 'Date',
      dataIndex: 'dateStart',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Time',
      key: 'time',
      render: (_: any, record: Booking) =>
        `${dayjs(record.dateStart).format('HH:mm')} - ${dayjs(record.dateEnd).format('HH:mm')}`,
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number | string) => `$${Number(price).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Booking) => (
        <Popconfirm
          title="Are you sure you want to cancel this booking?"
          onConfirm={() => cancelBooking.mutate(record.id)}
          okText="Yes"
          cancelText="No"
          disabled={record.status === 'cancelled' || record.status === 'done'}
        >
          <Button
            type="link"
            danger
            icon={<CloseOutlined />}
            disabled={record.status === 'cancelled' || record.status === 'done'}
          >
            Cancel
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageContainer
        title="My Bookings"
        breadcrumb={[{ label: 'My Bookings' }]}
      >
        <Card>
          <div style={{ marginBottom: 16, color: '#595959' }}>
            Here you can see your current and past bookings.
          </div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Spin size="large" />
            </div>
          ) : bookings && bookings.length > 0 ? (
            <Table
              columns={columns}
              dataSource={bookings}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          ) : (
            <Empty description="No bookings found" />
          )}
        </Card>
      </PageContainer>
    </MainLayout>
  );
};

