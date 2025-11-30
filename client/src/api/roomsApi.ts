import { axiosClient } from './axiosClient';

export type RoomType = 'desk' | 'vip' | 'meeting' | 'conference';
export type RoomStatus = 'active' | 'inactive' | 'maintenance';

export interface Room {
  id: number;
  slug: string;
  name: string;
  type: RoomType;
  capacity: number;
  priceHour: number;
  amenities: string[];
  photos: string[];
  description: string | null;
  location: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  slug: string;
  name: string;
  type: RoomType;
  capacity: number;
  priceHour: number;
  amenities?: string[];
  description?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface UpdateRoomDto {
  name?: string;
  type?: RoomType;
  capacity?: number;
  priceHour?: number;
  amenities?: string[];
  description?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  status?: RoomStatus;
}

export interface FilterRoomsDto {
  type?: RoomType;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: RoomStatus;
  search?: string;
}

export interface RoomAvailability {
  date: string;
  availableSlots: Array<{
    start: string;
    end: string;
    available: boolean;
  }>;
}

export const roomsApi = {
  getAll: async (filters?: FilterRoomsDto): Promise<Room[]> => {
    const { data } = await axiosClient.get<Room[]>('/api/rooms', { params: filters });
    return data;
  },

  getById: async (id: number): Promise<Room> => {
    const { data } = await axiosClient.get<Room>(`/api/rooms/${id}`);
    return data;
  },

  getAvailability: async (id: number, date: string): Promise<RoomAvailability> => {
    const { data } = await axiosClient.get<RoomAvailability>(
      `/api/rooms/availability/${id}`,
      { params: { date } }
    );
    return data;
  },

  create: async (createDto: CreateRoomDto): Promise<Room> => {
    const { data } = await axiosClient.post<Room>('/api/rooms', createDto);
    return data;
  },

  update: async (id: number, updateDto: UpdateRoomDto): Promise<Room> => {
    const { data } = await axiosClient.put<Room>(`/api/rooms/${id}`, updateDto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/api/rooms/${id}`);
  },

  uploadPhotos: async (roomId: number, files: File[]): Promise<{ photos: string[]; room: Room }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const { data } = await axiosClient.post<{ photos: string[]; room: Room }>(
      `/api/rooms/upload?roomId=${roomId}`,
      formData
    );
    return data;
  },
};

