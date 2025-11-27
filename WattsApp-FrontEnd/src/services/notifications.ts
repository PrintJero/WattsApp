import { API_BASE_URL } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface NotificationItem {
  id_notification: number;
  id_usuario: number;
  id_dispositivo?: number | null;
  type: string;
  title: string;
  body?: string | null;
  data?: any;
  is_read: number;
  created_at: string;
}

export const fetchNotifications = async (user_id: number, only_unread = false): Promise<NotificationItem[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications?user_id=${user_id}${only_unread ? '&only_unread=1' : ''}`);
    if (!res.ok) return [];
    const json: ApiResponse<NotificationItem[]> = await res.json();
    return json.data || [];
  } catch (err) {
    console.log('Error fetchNotifications', err);
    return [];
  }
};

export const createNotification = async (payload: { id_usuario: number; id_dispositivo?: number | null; type: string; title: string; body?: string; data?: any }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.log('Error createNotification', err);
    return { success: false, message: 'error' };
  }
};

export const markNotificationAsRead = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
    const json = await res.json();
    return json;
  } catch (err) {
    console.log('Error markNotificationAsRead', err);
    return { success: false };
  }
};

export const deleteNotification = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json;
  } catch (err) {
    console.log('Error deleteNotification', err);
    return { success: false };
  }
};

export default { fetchNotifications, createNotification, markNotificationAsRead, deleteNotification };
