import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Space,
  Button,
  DatePicker,
  TimePicker,
  Image,
  List,
  Empty,
  Spin,
  Alert,
} from 'antd';
import { UserOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import { useRoom } from '../../hooks/useRooms';
import { useCreateBooking } from '../../hooks/useBookings';
import { PageContainer } from '../../components/PageContainer';
import { MainLayout } from '../layout/MainLayout';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = TimePicker;

export const RoomDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roomId = id ? parseInt(id) : 0;

  const { data: room, isLoading } = useRoom(roomId);
  const createBooking = useCreateBooking();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [timeRange, setTimeRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const handleCalculatePrice = () => {
    if (!selectedDate || !timeRange[0] || !timeRange[1] || !room) return;

    const start = selectedDate.hour(timeRange[0].hour()).minute(timeRange[0].minute());
    const end = selectedDate.hour(timeRange[1].hour()).minute(timeRange[1].minute());
    const hours = end.diff(start, 'hour', true);
    const price = hours * parseFloat(room.priceHour.toString());

    setCalculatedPrice(price);
  };

  const handleBookNow = async () => {
    if (!selectedDate || !timeRange[0] || !timeRange[1] || !room) return;

    const dateStart = selectedDate
      .hour(timeRange[0].hour())
      .minute(timeRange[0].minute())
      .second(0)
      .toISOString();
    const dateEnd = selectedDate
      .hour(timeRange[1].hour())
      .minute(timeRange[1].minute())
      .second(0)
      .toISOString();

    try {
      await createBooking.mutateAsync({
        roomId: room.id,
        dateStart,
        dateEnd,
      });
      navigate('/bookings/my');
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer title="Room Details">
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  if (!room) {
    return (
      <MainLayout>
        <PageContainer title="Room Details">
          <Empty description="Room not found" />
        </PageContainer>
      </MainLayout>
    );
  }

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
    <MainLayout>
      <PageContainer
        title={room.name}
        breadcrumb={[
          { label: 'Rooms', path: '/rooms' },
          { label: room.name },
        ]}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {room.photos && room.photos.length > 0 ? (
                <Image.PreviewGroup>
                  {room.photos.map((photo, index) => (
                    <Image
                      key={index}
                      src={photo.startsWith('http') ? photo : `http://localhost:5000${photo}`}
                      alt={`${room.name} - ${index + 1}`}
                      style={{ borderRadius: 8, marginBottom: 16 }}
                    />
                  ))}
                </Image.PreviewGroup>
              ) : (
                <div
                  style={{
                    height: 400,
                    background: '#F0F0F0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#595959',
                  }}
                >
                  No Images Available
                </div>
              )}

              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Tag color={getRoomTypeColor(room.type)} style={{ fontSize: 14, padding: '4px 12px' }}>
                      {room.type.toUpperCase()}
                    </Tag>
                  </div>

                  {room.description && (
                    <Paragraph style={{ color: '#595959', marginBottom: 0 }}>
                      {room.description}
                    </Paragraph>
                  )}

                  <div>
                    <Title level={5}>Amenities</Title>
                    <List
                      dataSource={room.amenities}
                      renderItem={(item) => <List.Item>{item}</List.Item>}
                      locale={{ emptyText: 'No amenities listed' }}
                    />
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Booking" style={{ position: 'sticky', top: 24 }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space>
                  <DollarOutlined style={{ color: '#1677FF', fontSize: 20 }} />
                  <Text strong style={{ fontSize: 20, color: '#1677FF' }}>
                    ${Number(room.priceHour).toFixed(2)}/hour
                  </Text>
                </Space>

                <Space>
                  <UserOutlined style={{ color: '#595959' }} />
                  <Text style={{ color: '#595959' }}>
                    Capacity: Up to {room.capacity} people
                  </Text>
                </Space>

                <div>
                  <Text strong>Select Date</Text>
                  <DatePicker
                    style={{ width: '100%', marginTop: 8 }}
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </div>

                <div>
                  <Text strong>Select Time Range</Text>
                  <RangePicker
                    style={{ width: '100%', marginTop: 8 }}
                    format="HH:mm"
                    value={timeRange}
                    onChange={(values) => setTimeRange(values as [Dayjs | null, Dayjs | null])}
                  />
                </div>

                <Button
                  type="default"
                  block
                  onClick={handleCalculatePrice}
                  disabled={!selectedDate || !timeRange[0] || !timeRange[1]}
                >
                  Calculate Price
                </Button>

                {calculatedPrice !== null && (
                  <Alert
                    message={`Total Price: $${calculatedPrice.toFixed(2)}`}
                    type="info"
                  />
                )}

                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={handleBookNow}
                  disabled={!selectedDate || !timeRange[0] || !timeRange[1]}
                  loading={createBooking.isPending}
                >
                  Book Now
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </MainLayout>
  );
};

