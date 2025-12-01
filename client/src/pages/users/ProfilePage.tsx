import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, Typography, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UpdateUserDto } from '../../api/usersApi';
import { PageContainer } from '../../components/PageContainer';
import { MainLayout } from '../layout/MainLayout';
import { authStore } from '../../store/authStore';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const currentUser = authStore((state) => state.user);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => usersApi.getMe(),
    enabled: !!currentUser,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.updateMe(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      authStore.getState().setUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
      message.success('Профіль успішно оновлено!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Не вдалося оновити профіль');
    },
  });

  const [passwordForm] = Form.useForm();
  const updatePasswordMutation = useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      usersApi.updatePassword(data),
    onSuccess: () => {
      passwordForm.resetFields();
      message.success('Пароль успішно оновлено!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Не вдалося оновити пароль');
    },
  });

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, form]);

  const onFinish = (values: { name: string; email: string }) => {
    updateMutation.mutate(values);
  };

  const onPasswordFinish = (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Нові паролі не співпадають!');
      return;
    }
    updatePasswordMutation.mutate({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer title="Мій профіль">
          <Card>
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Text>Завантаження...</Text>
            </div>
          </Card>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Мій профіль"
        breadcrumb={[{ label: 'Профіль' }]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Особиста інформація">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                name: user?.name,
                email: user?.email,
              }}
            >
              <Form.Item
                name="name"
                label="Повне ім'я"
                rules={[{ required: true, message: 'Будь ласка, введіть ваше ім\'я!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Повне ім'я" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Електронна адреса"
                rules={[
                  { required: true, message: 'Будь ласка, введіть вашу електронну адресу!' },
                  { type: 'email', message: 'Будь ласка, введіть валідну електронну адресу!' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Електронна адреса" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                  Оновити профіль
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Змінити пароль">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordFinish}
            >
              <Form.Item
                name="oldPassword"
                label="Поточний пароль"
                rules={[{ required: true, message: 'Будь ласка, введіть ваш поточний пароль!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Поточний пароль"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Новий пароль"
                rules={[
                  { required: true, message: 'Будь ласка, введіть ваш новий пароль!' },
                  { min: 8, message: 'Пароль повинен містити принаймні 8 символів!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Новий пароль"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Підтвердити новий пароль"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Будь ласка, підтвердіть ваш новий пароль!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Паролі не співпадають!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Підтвердити новий пароль"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={updatePasswordMutation.isPending}>
                  Змінити пароль
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </PageContainer>
    </MainLayout>
  );
};
