import React, { useState } from 'react';
import { Drawer, Form, Input, Select, InputNumber, Button, Space, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useCreateRoom, useUploadRoomPhotos } from '../../hooks/useRooms';
import { CreateRoomDto, RoomType } from '../../api/roomsApi';

const { TextArea } = Input;

interface RoomFormDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const RoomFormDrawer: React.FC<RoomFormDrawerProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const createRoom = useCreateRoom();
  const uploadPhotos = useUploadRoomPhotos();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Create room first
      createRoom.mutate(values as CreateRoomDto, {
        onSuccess: async (createdRoom) => {
          // Upload photos if any
          if (fileList.length > 0) {
            const files = fileList
              .filter((file) => file.originFileObj)
              .map((file) => file.originFileObj as File);
            
            try {
              await uploadPhotos.mutateAsync({
                roomId: createdRoom.id,
                files,
              });
            } catch (error) {
              // Photos upload failed, but room was created
              console.error('Failed to upload photos:', error);
            }
          }
          
          form.resetFields();
          setFileList([]);
          onClose();
        },
      });
    } catch (error) {
      // Form validation failed
    }
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Можна завантажувати лише файли зображень!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Зображення повинно бути менше 5МБ!');
      return false;
    }
    
    const newFile: UploadFile = {
      uid: `${Date.now()}-${Math.random()}`,
      name: file.name,
      status: 'done',
      originFileObj: file,
    };
    setFileList([...fileList, newFile]);
    return false; // Prevent auto upload
  };

  return (
    <Drawer
      title="Додати нову кімнату"
      open={open}
      onClose={() => {
        form.resetFields();
        setFileList([]);
        onClose();
      }}
      width={500}
      footer={
        <Space style={{ float: 'right' }}>
          <Button
            onClick={() => {
              form.resetFields();
              setFileList([]);
              onClose();
            }}
          >
            Скасувати
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={createRoom.isPending || uploadPhotos.isPending}
          >
            Створити
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: 'Будь ласка, введіть slug!' },
            { 
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 
              message: 'Slug повинен містити лише малі літери, цифри та дефіси!' 
            }
          ]}
        >
          <Input placeholder="наприклад, conference-room-a" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Назва кімнати"
          rules={[{ required: true, message: 'Будь ласка, введіть назву кімнати!' }]}
        >
          <Input placeholder="наприклад, Конференц-зал A" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Тип кімнати"
          rules={[{ required: true, message: 'Будь ласка, оберіть тип кімнати!' }]}
        >
          <Select placeholder="Оберіть тип кімнати">
            <Select.Option value="desk">Робоче місце</Select.Option>
            <Select.Option value="vip">VIP</Select.Option>
            <Select.Option value="meeting">Зустріч</Select.Option>
            <Select.Option value="conference">Конференція</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="capacity"
          label="Місткість"
          rules={[{ required: true, message: 'Будь ласка, введіть місткість!' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} placeholder="Кількість осіб" />
        </Form.Item>

        <Form.Item
          name="priceHour"
          label="Ціна за годину ($)"
          rules={[{ required: true, message: 'Будь ласка, введіть ціну!' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item name="description" label="Опис">
          <TextArea rows={4} placeholder="Опис кімнати..." />
        </Form.Item>

        <Form.Item
          name="amenities"
          label="Зручності (через кому)"
          getValueFromEvent={(e) => {
            const value = e.target.value;
            return value ? value.split(',').map((item: string) => item.trim()) : [];
          }}
          getValueProps={(value) => ({
            value: Array.isArray(value) ? value.join(', ') : value || '',
          })}
        >
          <Input placeholder="наприклад, WiFi, Проектор, Дошка" />
        </Form.Item>

        <Form.Item label="Фото">
          <Upload
            fileList={fileList}
            beforeUpload={beforeUpload}
            onRemove={handleRemove}
            multiple
            listType="picture-card"
            maxCount={10}
            accept="image/*"
          >
            {fileList.length < 10 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Завантажити</div>
              </div>
            )}
          </Upload>
          <div style={{ marginTop: 8, color: '#595959', fontSize: 12 }}>
            Можна завантажити до 10 зображень. Максимальний розмір файлу: 5МБ на зображення.
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

