import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate('/rooms');
    } catch (error) {
      // Error is handled in useAuth hook
    }
  };

  return (
    <AuthLayout>
      <Card style={{ padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32, color: '#1F1F1F' }}>
          Створити обліковий запис
        </Title>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Повне ім'я"
            rules={[{ required: true, message: 'Будь ласка, введіть ваше ім\'я!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Повне ім'я"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Електронна адреса"
            rules={[
              { required: true, message: 'Будь ласка, введіть вашу електронну адресу!' },
              { type: 'email', message: 'Будь ласка, введіть валідну електронну адресу!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Електронна адреса"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Будь ласка, введіть ваш пароль!' },
              { min: 8, message: 'Пароль повинен містити принаймні 8 символів!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Підтвердити пароль"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Будь ласка, підтвердіть ваш пароль!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Паролі не співпадають!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Підтвердити пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Зареєструватися
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text style={{ color: '#595959' }}>
            Вже маєте обліковий запис?{' '}
            <Link to="/login" style={{ color: '#1677FF' }}>
              Увійти
            </Link>
          </Text>
        </div>
      </Card>
    </AuthLayout>
  );
};

