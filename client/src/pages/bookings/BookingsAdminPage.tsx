import React, { useState } from 'react';
import { Table, Card, Tag, Select, DatePicker, Space, Empty, Spin } from 'antd';
import { useAllBookings, useUpdateBookingStatus } from '../../hooks/useBookings';
import { PageContainer } from '../../components/PageContainer';
import { MainLayout } from '../layout/MainLayout';
import { Booking, BookingStatus } from '../../api/bookingsApi';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export const BookingsAdminPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(dateRange && dateRange[0] && { dateStart: dateRange[0].format('YYYY-MM-DD') }),
    ...(dateRange && dateRange[1] && { dateEnd: dateRange[1].format('YYYY-MM-DD') }),
  };

  const { data, isLoading } = useAllBookings(page, limit, filters);
  const updateStatus = useUpdateBookingStatus();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'cyan',
      paid: 'green',
      cancelled: 'red',
      done: 'default',
    };
    return colors[status] || 'default';
  };

  const handleStatusChange = (bookingId: number, newStatus: BookingStatus) => {
    updateStatus.mutate({ id: bookingId, status: { status: newStatus } });
  };

  const columns = [
    {
      title: 'ID бронювання',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Користувач',
      key: 'user',
      render: (_: any, record: Booking) =>
        record.user ? `${record.user.name} (${record.user.email})` : 'Н/Д',
    },
    {
      title: 'Кімната',
      dataIndex: 'room',
      key: 'room',
      render: (room: Booking['room']) => room?.name || 'Н/Д',
    },
    {
      title: 'Дата та час',
      key: 'datetime',
      render: (_: any, record: Booking) => (
        <div>
          <div>{dayjs(record.dateStart).format('DD MMM YYYY')}</div>
          <div style={{ color: '#595959', fontSize: 12 }}>
            {dayjs(record.dateStart).format('HH:mm')} - {dayjs(record.dateEnd).format('HH:mm')}
          </div>
        </div>
      ),
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
      render: (status: BookingStatus, record: Booking) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
        >
          <Select.Option value="pending">
            <Tag color="cyan">ОЧІКУЄТЬСЯ</Tag>
          </Select.Option>
          <Select.Option value="paid">
            <Tag color="green">СПЛАЧЕНО</Tag>
          </Select.Option>
          <Select.Option value="cancelled">
            <Tag color="red">СКАСОВАНО</Tag>
          </Select.Option>
          <Select.Option value="done">
            <Tag>ЗАВЕРШЕНО</Tag>
          </Select.Option>
        </Select>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageContainer
        title="Всі бронювання"
        breadcrumb={[{ label: 'Бронювання' }]}
        extra={
          <Space>
            <Select
              placeholder="Фільтр за статусом"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={[
                { label: 'Очікується', value: 'pending' },
                { label: 'Сплачено', value: 'paid' },
                { label: 'Скасовано', value: 'cancelled' },
                { label: 'Завершено', value: 'done' },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates ? (dates as [Dayjs | null, Dayjs | null]) : [null, null]);
                setPage(1);
              }}
            />
          </Space>
        }
      >
        <Card>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Spin size="large" />
            </div>
          ) : data && data.data && data.data.length > 0 ? (
            <Table
              columns={columns}
              dataSource={data.data}
              rowKey="id"
              pagination={{
                current: page,
                pageSize: limit,
                total: data.total,
                onChange: (page) => setPage(page),
              }}
            />
          ) : (
            <Empty description="Бронювання не знайдено" />
          )}
        </Card>
      </PageContainer>
    </MainLayout>
  );
};

