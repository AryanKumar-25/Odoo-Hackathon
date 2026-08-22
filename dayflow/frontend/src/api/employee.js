import apiClient from './client';

export const getMyAttendance = (month) => apiClient.get('/employee/attendance/me', { params: { month } });
export const checkIn = () => apiClient.post('/employee/attendance/checkin');
export const checkOut = () => apiClient.post('/employee/attendance/checkout');

export const applyLeave = (data) => apiClient.post('/employee/leave/apply', data);
export const getMyLeaves = () => apiClient.get('/employee/leave/me');
export const getLeaveBalance = () => apiClient.get('/employee/leave/balance');
