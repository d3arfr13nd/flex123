import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, CreateBookingDto, UpdateBookingStatusDto } from '../api/bookingsApi';
import { message } from 'antd';

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingsApi.getMyBookings(),
  });
};

export const useAllBookings = (
  page = 1,
  limit = 10,
  filters?: { status?: string; dateStart?: string; dateEnd?: string }
) => {
  return useQuery({
    queryKey: ['bookings', page, limit, filters],
    queryFn: () => bookingsApi.getAll({ page, limit, ...filters }),
  });
};

export const useBooking = (id: number) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Бронювання успішно створено!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Не вдалося створити бронювання');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Бронювання успішно скасовано!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Не вдалося скасувати бронювання');
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: UpdateBookingStatusDto }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      message.success('Статус бронювання успішно оновлено!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Не вдалося оновити статус бронювання');
    },
  });
};

