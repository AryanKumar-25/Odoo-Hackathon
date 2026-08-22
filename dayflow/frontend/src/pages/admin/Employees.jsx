import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress
} from '@mui/material';
import { getEmployees, updateEmployee } from '../../api/admin';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEditClick = (employee) => {
    setEditData({ ...employee });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };

  const handleSave = async () => {
    try {
      await updateEmployee(editData.id, editData);
      fetchEmployees(); // Refresh list
      handleClose();
    } catch (error) {
      console.error('Error updating employee', error);
      alert('Failed to update employee');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Employees Management</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.id}</TableCell>
                <TableCell>{emp.employeeId}</TableCell>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleEditClick(emp)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          {editData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField 
                label="Employee ID" 
                value={editData.employeeId} 
                onChange={(e) => setEditData({ ...editData, employeeId: e.target.value })} 
              />
              <TextField 
                label="Name" 
                value={editData.name} 
                onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
              />
              <TextField 
                label="Email" 
                value={editData.email} 
                onChange={(e) => setEditData({ ...editData, email: e.target.value })} 
              />
              <TextField 
                select
                label="Role" 
                value={editData.role} 
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;
