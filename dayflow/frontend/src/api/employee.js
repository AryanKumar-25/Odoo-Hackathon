import apiClient from './client';

export const getMyAttendance = (month) => apiClient.get('/employee/attendance/me', { params: { month } });
export const checkIn = () => apiClient.post('/employee/attendance/checkin');
export const checkOut = () => apiClient.post('/employee/attendance/checkout');
