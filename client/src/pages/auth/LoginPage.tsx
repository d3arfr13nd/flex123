import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await login(values);
      navigate('/rooms');
    } catch (error) {
      // Error is handled in useAuth hook
    }
  };

  return (
    <AuthLayout>
      <Card style={{ padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32, color: '#1F1F1F' }}>
          Вхід до FlexSpace
        </Title>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Електронна адреса"
            rules={[
              { required: true, message: 'Будь ласка, введіть вашу електронну адресу!' },
              { type: 'email', message: 'Будь ласка, введіть валідну електронну адресу!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
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

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Увійти
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text style={{ color: '#595959' }}>
            Немає облікового запису?{' '}
            <Link to="/register" style={{ color: '#1677FF' }}>
              Зареєструватися
            </Link>
          </Text>
        </div>
      </Card>
    </AuthLayout>
  );
};

