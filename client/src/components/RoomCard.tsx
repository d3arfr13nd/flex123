import React from 'react';
import { Card, Tag, Typography, Space, Button, Image } from 'antd';
import { UserOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Room } from '../api/roomsApi';

const { Title, Text } = Typography;

interface RoomCardProps {
  room: Room;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  const getRoomTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      desk: 'blue',
      vip: 'gold',
      meeting: 'green',
      conference: 'purple',
    };
    return colors[type] || 'default';
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: 8,
        overflow: 'hidden',
      }}
      cover={
        room.photos && room.photos.length > 0 ? (
          <Image
            alt={room.name}
            src={room.photos[0].startsWith('http') ? room.photos[0] : `http://localhost:5000${room.photos[0]}`}
            height={200}
            style={{ objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          <div
            style={{
              height: 200,
              background: '#F0F0F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#595959',
            }}
          >
            No Image
          </div>
        )
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Title level={4} style={{ margin: 0, color: '#1F1F1F' }}>
            {room.name}
          </Title>
          <Tag color={getRoomTypeColor(room.type)}>{room.type.toUpperCase()}</Tag>
        </div>

        <Space>
          <UserOutlined style={{ color: '#595959' }} />
          <Text style={{ color: '#595959' }}>Up to {room.capacity} people</Text>
        </Space>

        <Space>
          <DollarOutlined style={{ color: '#1677FF', fontWeight: 'bold' }} />
          <Text strong style={{ color: '#1677FF', fontSize: '16px' }}>
            ${Number(room.priceHour).toFixed(2)}/hour
          </Text>
        </Space>

        <Space style={{ width: '100%', marginTop: 8 }}>
          <Button
            onClick={() => navigate(`/rooms/${room.id}`)}
            style={{ flex: 1 }}
          >
            View Details
          </Button>
          <Button
            type="primary"
            onClick={() => navigate(`/rooms/${room.id}`)}
            style={{ flex: 1 }}
          >
            Book Now
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

