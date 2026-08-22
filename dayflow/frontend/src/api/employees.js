import apiClient from './client';

export const getEmployeeDirectory = () => apiClient.get('/employees');
export const getEmployeeProfile = (employeeId, tab) => apiClient.get(`/employees/${employeeId}/profile`, { params: { tab } });
export const updateEmployeeProfile = (employeeId, data) => apiClient.patch(`/employees/${employeeId}/profile`, data);
export const updateEmployeeSalary = (employeeId, data) => apiClient.put(`/employees/${employeeId}/salary`, data);
