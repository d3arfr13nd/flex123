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
      message.success('Користувача успішно оновлено!');
      setEditingUser(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Не вдалося оновити користувача');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Користувача успішно видалено!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Не вдалося видалити користувача');
    },
  });

  const columns = [
    {
      title: 'Ім\'я',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Електронна адреса',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Admin' ? 'red' : 'blue'}>{role === 'Admin' ? 'Адмін' : 'Користувач'}</Tag>
      ),
    },
    {
      title: 'Дата створення',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('uk-UA'),
    },
    {
      title: 'Дії',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => setEditingUser(record)}
          >
            Редагувати
          </Button>
          <Popconfirm
            title="Ви впевнені, що хочете видалити цього користувача?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Так"
            cancelText="Ні"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Видалити
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageContainer
        title="Користувачі"
        breadcrumb={[{ label: 'Користувачі' }]}
        extra={
          <Space>
            <Select
              placeholder="Фільтр за роллю"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setRoleFilter(value)}
              options={[
                { label: 'Користувач', value: 'User' },
                { label: 'Адмін', value: 'Admin' },
              ]}
            />
            <Search
              placeholder="Пошук за ім'ям або email"
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

