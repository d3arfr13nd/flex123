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
      message.success('Booking created successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create booking');
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
      message.success('Booking cancelled successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to cancel booking');
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
      message.success('Booking status updated successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update booking status');
    },
  });
};

