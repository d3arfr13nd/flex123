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
      message.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const [passwordForm] = Form.useForm();
  const updatePasswordMutation = useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      usersApi.updatePassword(data),
    onSuccess: () => {
      passwordForm.resetFields();
      message.success('Password updated successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update password');
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
      message.error('New passwords do not match!');
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
        <PageContainer title="My Profile">
          <Card>
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Text>Loading...</Text>
            </div>
          </Card>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="My Profile"
        breadcrumb={[{ label: 'Profile' }]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Personal Information">
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
                label="Full Name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Change Password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordFinish}
            >
              <Form.Item
                name="oldPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Current Password"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="New Password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm New Password"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={updatePasswordMutation.isPending}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </PageContainer>
    </MainLayout>
  );
};
