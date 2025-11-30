import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import { CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { Booking } from '../api/bookingsApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'cyan',
      paid: 'green',
      cancelled: 'red',
      done: 'default',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const formatTime = (dateString: string) => {
    return dayjs(dateString).format('HH:mm');
  };

  return (
    <Card style={{ marginBottom: 16, borderRadius: 8 }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Title level={5} style={{ margin: 0, color: '#1F1F1F' }}>
            {booking.room?.name || `Room #${booking.roomId}`}
          </Title>
          <Tag color={getStatusColor(booking.status)}>
            {booking.status.toUpperCase()}
          </Tag>
        </div>

        <Space>
          <CalendarOutlined style={{ color: '#595959' }} />
          <Text style={{ color: '#595959' }}>
            {formatDate(booking.dateStart)} • {formatTime(booking.dateStart)} - {formatTime(booking.dateEnd)}
          </Text>
        </Space>

        <Space>
          <DollarOutlined style={{ color: '#1677FF' }} />
          <Text strong style={{ color: '#1677FF' }}>
            ${booking.totalPrice}
          </Text>
        </Space>
      </Space>
    </Card>
  );
};

