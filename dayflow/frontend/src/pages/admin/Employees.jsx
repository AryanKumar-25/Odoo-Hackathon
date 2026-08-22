import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getEmployees, updateEmployee, createEmployee } from '../../api/admin';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Add Modal State
  const [addOpen, setAddOpen] = useState(false);
  const [addData, setAddData] = useState({ name: '', email: '', phone: '', dateOfJoining: '' });
  const [addLoading, setAddLoading] = useState(false);

  // Success Dialog State
  const [successOpen, setSuccessOpen] = useState(false);
  const [credentials, setCredentials] = useState(null); // { employeeId, plaintextPassword }

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

  // --- Edit Flow ---
  const handleEditClick = (employee) => {
    setEditData({ ...employee });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditData(null);
  };

  const handleEditSave = async () => {
    try {
      await updateEmployee(editData.id, editData);
      fetchEmployees();
      handleEditClose();
    } catch (error) {
      console.error('Error updating employee', error);
      alert('Failed to update employee');
    }
  };

  // --- Add Flow ---
  const handleAddOpen = () => {
    setAddData({ name: '', email: '', phone: '', dateOfJoining: '' });
    setAddOpen(true);
  };

  const handleAddClose = () => {
    setAddOpen(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      // Send data to backend. (Note: backend auto-generates year, so dateOfJoining is mostly UI)
      const res = await createEmployee(addData);
      
      // Close add modal, open success modal with credentials
      setAddOpen(false);
      setCredentials({
        employeeId: res.data.user.employeeId,
        plaintextPassword: res.data.plaintextPassword
      });
      
    } catch (error) {
      console.error('Error creating employee', error);
      alert(error.response?.data?.error || 'Failed to create employee');
    } finally {
      setAddLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    setCredentials(null);
    fetchEmployees(); // Refresh table immediately after closing the dialog
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Employees Management</Typography>
        <Button variant="contained" color="primary" onClick={handleAddOpen}>
          Add Employee
        </Button>
      </Box>

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
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No employees found.</TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
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
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={addOpen} onClose={handleAddClose} fullWidth maxWidth="sm">
        <form onSubmit={handleAddSubmit}>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField 
                label="Name" 
                value={addData.name} 
                onChange={(e) => setAddData({ ...addData, name: e.target.value })} 
                required
              />
              <TextField 
                label="Email" 
                type="email"
                value={addData.email} 
                onChange={(e) => setAddData({ ...addData, email: e.target.value })} 
                required
              />
              <TextField 
                label="Phone (Optional)" 
                value={addData.phone} 
                onChange={(e) => setAddData({ ...addData, phone: e.target.value })} 
              />
              <TextField 
                label="Date of Joining" 
                type="date"
                InputLabelProps={{ shrink: true }}
                value={addData.dateOfJoining} 
                onChange={(e) => setAddData({ ...addData, dateOfJoining: e.target.value })} 
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddClose} disabled={addLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={addLoading}>
              {addLoading ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Success/Credentials Dialog */}
      <Dialog open={!!credentials} onClose={handleSuccessClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'success.main', fontWeight: 'bold' }}>Employee Created Successfully!</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please copy the credentials below and securely share them with the new employee.
          </Typography>
          <Typography variant="body2" color="error" fontWeight="bold" gutterBottom>
            Save this now — the temporary password will NEVER be shown again.
          </Typography>

          {credentials && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid #ccc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Generated Employee ID</Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>{credentials.employeeId}</Typography>
                </Box>
                <Tooltip title="Copy ID">
                  <IconButton onClick={() => copyToClipboard(credentials.employeeId)} color="primary">
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Temporary Password</Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>{credentials.plaintextPassword}</Typography>
                </Box>
                <Tooltip title="Copy Password">
                  <IconButton onClick={() => copyToClipboard(credentials.plaintextPassword)} color="primary">
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained" color="primary">
            I have saved the credentials
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Employees;
