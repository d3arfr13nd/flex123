import { axiosClient } from './axiosClient';

export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'done';

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  room?: {
    id: number;
    name: string;
    type: string;
    photos: string[];
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  dateStart: string;
  dateEnd: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  roomId: number;
  dateStart: string;
  dateEnd: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
}

export interface BookingsListResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

export const bookingsApi = {
  create: async (createDto: CreateBookingDto): Promise<Booking> => {
    const { data } = await axiosClient.post<Booking>('/api/bookings', createDto);
    return data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: BookingStatus;
    dateStart?: string;
    dateEnd?: string;
  }): Promise<BookingsListResponse> => {
    // Remove undefined values from params
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, value]) => value !== undefined)
    );
    const { data } = await axiosClient.get<BookingsListResponse>('/api/bookings', { params: cleanParams });
    return data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await axiosClient.get<Booking[]>('/api/bookings/user');
    return data;
  },

  getById: async (id: number): Promise<Booking> => {
    const { data } = await axiosClient.get<Booking>(`/api/bookings/${id}`);
    return data;
  },

  cancel: async (id: number): Promise<Booking> => {
    const { data } = await axiosClient.put<Booking>(`/api/bookings/${id}/cancel`);
    return data;
  },

  updateStatus: async (id: number, statusDto: UpdateBookingStatusDto): Promise<Booking> => {
    const { data } = await axiosClient.put<Booking>(`/api/bookings/${id}/status`, statusDto);
    return data;
  },
};

