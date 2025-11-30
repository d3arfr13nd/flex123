import React, { useState } from 'react';
import { Table, Card, Input, Tag, Button, Popconfirm, Space, Select } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, User, UpdateUserDto } from '../../api/usersApi';
import { PageContainer } from '../../components/PageContainer';
import { MainLayout } from '../layout/MainLayout';
import { message } from 'antd';
import { UserEditDrawer } from './UserEditDrawer';

const { Search } = Input;

export const UsersListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'User' | 'Admin' | undefined>();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, limit, search, roleFilter],
    queryFn: () => usersApi.getAll({ page, limit, search, role: roleFilter }),
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User updated successfully!');
      setEditingUser(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User deleted successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Admin' ? 'red' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => setEditingUser(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageContainer
        title="Users"
        breadcrumb={[{ label: 'Users' }]}
        extra={
          <Space>
            <Select
              placeholder="Filter by role"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setRoleFilter(value)}
              options={[
                { label: 'User', value: 'User' },
                { label: 'Admin', value: 'Admin' },
              ]}
            />
            <Search
              placeholder="Search by name or email"
              allowClear
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </Space>
        }
      >
        <Card>
          <Table
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.total || 0,
              onChange: (page) => setPage(page),
            }}
          />
        </Card>
        {editingUser && (
          <UserEditDrawer
            user={editingUser}
            open={!!editingUser}
            onClose={() => setEditingUser(null)}
            onSave={(data) => updateMutation.mutate({ id: editingUser.id, data })}
          />
        )}
      </PageContainer>
    </MainLayout>
  );
};

