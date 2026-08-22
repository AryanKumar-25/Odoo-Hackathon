import apiClient from './client';

export const getAdminPayroll = (month, year) => 
  apiClient.get('/payroll', { params: { month, year } });

export const getEmployeePayroll = (employeeId, month, year) => 
  apiClient.get(`/payroll/${employeeId}`, { params: { month, year } });

export const generatePayroll = (month, year, employeeId) => 
  apiClient.post('/payroll/generate', { month, year, employeeId });

export const updatePayroll = (id, data) => 
  apiClient.put(`/payroll/${id}`, data);

export const finalizePayroll = (id) => 
  apiClient.put(`/payroll/${id}/finalize`);
