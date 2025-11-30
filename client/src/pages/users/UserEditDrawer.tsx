import React from 'react';
import { Drawer, Form, Input, Select, Button, Space } from 'antd';
import { User, UpdateUserDto } from '../../api/usersApi';

interface UserEditDrawerProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSave: (data: UpdateUserDto) => void;
}

export const UserEditDrawer: React.FC<UserEditDrawerProps> = ({
  user,
  open,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSave(values);
    });
  };

  return (
    <Drawer
      title="Edit User"
      open={open}
      onClose={onClose}
      width={400}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select role!' }]}
        >
          <Select>
            <Select.Option value="User">User</Select.Option>
            <Select.Option value="Admin">Admin</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

