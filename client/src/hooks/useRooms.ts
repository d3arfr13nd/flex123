import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi, FilterRoomsDto, CreateRoomDto, UpdateRoomDto } from '../api/roomsApi';
import { message } from 'antd';

export const useRooms = (filters?: FilterRoomsDto) => {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => roomsApi.getAll(filters),
  });
};

export const useRoom = (id: number) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => roomsApi.getById(id),
    enabled: !!id,
  });
};

export const useRoomAvailability = (id: number, date: string) => {
  return useQuery({
    queryKey: ['roomAvailability', id, date],
    queryFn: () => roomsApi.getAvailability(id, date),
    enabled: !!id && !!date,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomDto) => roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      message.success('Room created successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create room');
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoomDto }) =>
      roomsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', variables.id] });
      message.success('Room updated successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update room');
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      message.success('Room deleted successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete room');
    },
  });
};

export const useUploadRoomPhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, files }: { roomId: number; files: File[] }) =>
      roomsApi.uploadPhotos(roomId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', variables.roomId] });
      message.success('Photos uploaded successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to upload photos');
    },
  });
};

