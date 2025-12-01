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
      title: 'Кімната',
      dataIndex: 'room',
      key: 'room',
      render: (room: Booking['room']) => room?.name || 'Н/Д',
    },
    {
      title: 'Дата',
      dataIndex: 'dateStart',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Час',
      key: 'time',
      render: (_: any, record: Booking) =>
        `${dayjs(record.dateStart).format('HH:mm')} - ${dayjs(record.dateEnd).format('HH:mm')}`,
    },
    {
      title: 'Загальна ціна',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number | string) => `$${Number(price).toFixed(2)}`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          pending: 'Очікується',
          paid: 'Сплачено',
          cancelled: 'Скасовано',
          done: 'Завершено',
        };
        return (
          <Tag color={getStatusColor(status)}>{statusMap[status] || status.toUpperCase()}</Tag>
        );
      },
    },
    {
      title: 'Дії',
      key: 'actions',
      render: (_: any, record: Booking) => (
        <Popconfirm
          title="Ви впевнені, що хочете скасувати це бронювання?"
          onConfirm={() => cancelBooking.mutate(record.id)}
          okText="Так"
          cancelText="Ні"
          disabled={record.status === 'cancelled' || record.status === 'done'}
        >
          <Button
            type="link"
            danger
            icon={<CloseOutlined />}
            disabled={record.status === 'cancelled' || record.status === 'done'}
          >
            Скасувати
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageContainer
        title="Мої бронювання"
        breadcrumb={[{ label: 'Мої бронювання' }]}
      >
        <Card>
          <div style={{ marginBottom: 16, color: '#595959' }}>
            Тут ви можете переглянути ваші поточні та минулі бронювання.
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
            <Empty description="Бронювання не знайдено" />
          )}
        </Card>
      </PageContainer>
    </MainLayout>
  );
};

