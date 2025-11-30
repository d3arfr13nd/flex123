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
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: Booking) =>
        record.user ? `${record.user.name} (${record.user.email})` : 'N/A',
    },
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
      render: (room: Booking['room']) => room?.name || 'N/A',
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_: any, record: Booking) => (
        <div>
          <div>{dayjs(record.dateStart).format('MMM DD, YYYY')}</div>
          <div style={{ color: '#595959', fontSize: 12 }}>
            {dayjs(record.dateStart).format('HH:mm')} - {dayjs(record.dateEnd).format('HH:mm')}
          </div>
        </div>
      ),
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
      render: (status: BookingStatus, record: Booking) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
        >
          <Select.Option value="pending">
            <Tag color="cyan">PENDING</Tag>
          </Select.Option>
          <Select.Option value="paid">
            <Tag color="green">PAID</Tag>
          </Select.Option>
          <Select.Option value="cancelled">
            <Tag color="red">CANCELLED</Tag>
          </Select.Option>
          <Select.Option value="done">
            <Tag>DONE</Tag>
          </Select.Option>
        </Select>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageContainer
        title="All Bookings"
        breadcrumb={[{ label: 'Bookings' }]}
        extra={
          <Space>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Paid', value: 'paid' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Done', value: 'done' },
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
            <Empty description="No bookings found" />
          )}
        </Card>
      </PageContainer>
    </MainLayout>
  );
};

