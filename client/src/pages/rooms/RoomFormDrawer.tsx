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
      message.error('You can only upload image files!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
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
      title="Add New Room"
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
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={createRoom.isPending || uploadPhotos.isPending}
          >
            Create
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: 'Please input slug!' },
            { 
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 
              message: 'Slug must be lowercase letters, numbers, and hyphens only!' 
            }
          ]}
        >
          <Input placeholder="e.g., conference-room-a" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Room Name"
          rules={[{ required: true, message: 'Please input room name!' }]}
        >
          <Input placeholder="e.g., Conference Room A" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Room Type"
          rules={[{ required: true, message: 'Please select room type!' }]}
        >
          <Select placeholder="Select room type">
            <Select.Option value="desk">Desk</Select.Option>
            <Select.Option value="vip">VIP</Select.Option>
            <Select.Option value="meeting">Meeting</Select.Option>
            <Select.Option value="conference">Conference</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="capacity"
          label="Capacity"
          rules={[{ required: true, message: 'Please input capacity!' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} placeholder="Number of people" />
        </Form.Item>

        <Form.Item
          name="priceHour"
          label="Price per Hour ($)"
          rules={[{ required: true, message: 'Please input price!' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Room description..." />
        </Form.Item>

        <Form.Item
          name="amenities"
          label="Amenities (comma-separated)"
          getValueFromEvent={(e) => {
            const value = e.target.value;
            return value ? value.split(',').map((item: string) => item.trim()) : [];
          }}
          getValueProps={(value) => ({
            value: Array.isArray(value) ? value.join(', ') : value || '',
          })}
        >
          <Input placeholder="e.g., WiFi, Projector, Whiteboard" />
        </Form.Item>

        <Form.Item label="Photos">
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
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
          <div style={{ marginTop: 8, color: '#595959', fontSize: 12 }}>
            You can upload up to 10 images. Max file size: 5MB per image.
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

