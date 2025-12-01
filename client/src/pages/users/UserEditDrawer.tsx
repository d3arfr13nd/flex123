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
      title="Редагувати користувача"
      open={open}
      onClose={onClose}
      width={400}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>Скасувати</Button>
          <Button type="primary" onClick={handleSubmit}>
            Зберегти
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
          label="Ім'я"
          rules={[{ required: true, message: 'Будь ласка, введіть ім\'я!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Електронна адреса"
          rules={[
            { required: true, message: 'Будь ласка, введіть електронну адресу!' },
            { type: 'email', message: 'Будь ласка, введіть валідну електронну адресу!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="role"
          label="Роль"
          rules={[{ required: true, message: 'Будь ласка, оберіть роль!' }]}
        >
          <Select>
            <Select.Option value="User">Користувач</Select.Option>
            <Select.Option value="Admin">Адмін</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

