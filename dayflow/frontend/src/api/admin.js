import apiClient from './client';

// Employees
export const getEmployees = () => apiClient.get('/admin/employees');
export const getEmployee = (id) => apiClient.get(`/admin/employees/${id}`);
export const updateEmployee = (id, data) => apiClient.patch(`/admin/employees/${id}`, data);
export const createEmployee = (data) => apiClient.post('/admin/employees', data);

// Attendance
export const getAttendance = (params) => apiClient.get('/admin/attendance', { params });

// Leaves
export const getLeaves = (params) => apiClient.get('/admin/leave', { params });
export const updateLeaveStatus = (id, status, adminComment) => apiClient.patch(`/admin/leave/${id}`, { status, adminComment });

// Payroll
export const getPayrolls = () => apiClient.get('/admin/payroll');
export const updatePayroll = (employeeId, data) => apiClient.patch(`/admin/payroll/${employeeId}`, data);
