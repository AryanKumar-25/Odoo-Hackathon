import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, IconButton, Tooltip, Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getEmployees, updateEmployee, createEmployee } from '../../api/admin';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addData, setAddData] = useState({ name: '', email: '', phone: '', dateOfJoining: '' });
  const [addLoading, setAddLoading] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);

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
      const res = await createEmployee(addData);
      
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
    fetchEmployees(); 
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, p: 4, bgcolor: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '8px 8px 0 #000' }}><CircularProgress sx={{ color: '#000' }} /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>EMPLOYEES</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19' }}>
            Manage organization members and roles.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={handleAddOpen}
          sx={{ bgcolor: '#FFE17C', color: '#000', py: 1.5, px: 3, fontSize: '1.1rem', '&:hover': { bgcolor: '#e5ca6f' } }}
        >
          + ADD EMPLOYEE
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#fff' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SYSTEM ID</TableCell>
              <TableCell>EMP ID</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>EMAIL</TableCell>
              <TableCell>ROLE</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>NO EMPLOYEES</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    No employees found in the directory.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#666' }}>{emp.id}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{emp.employeeId}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{emp.name}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{emp.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={emp.role.toUpperCase()} 
                      size="small" 
                      sx={{
                        fontWeight: 800,
                        border: '2px solid #000',
                        bgcolor: emp.role === 'admin' ? '#B7C6C2' : '#FFE17C',
                        color: '#000'
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => handleEditClick(emp)} sx={{ bgcolor: '#fff' }}>EDIT</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog 
        open={editOpen} 
        onClose={handleEditClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { bgcolor: '#fff' } }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Cabinet Grotesk, system-ui, sans-serif',
          fontWeight: 800,
          textTransform: 'uppercase',
          borderBottom: '2px solid #000',
          bgcolor: '#FFE17C',
          color: '#000'
        }}>
          EDIT EMPLOYEE
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {editData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField 
                label="EMPLOYEE ID" 
                value={editData.employeeId} 
                onChange={(e) => setEditData({ ...editData, employeeId: e.target.value })} 
                InputLabelProps={{ sx: { fontWeight: 800 } }}
              />
              <TextField 
                label="NAME" 
                value={editData.name} 
                onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                InputLabelProps={{ sx: { fontWeight: 800 } }}
              />
              <TextField 
                label="EMAIL" 
                value={editData.email} 
                onChange={(e) => setEditData({ ...editData, email: e.target.value })} 
                InputLabelProps={{ sx: { fontWeight: 800 } }}
              />
              <TextField 
                select
                label="ROLE" 
                value={editData.role} 
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                InputLabelProps={{ sx: { fontWeight: 800 } }}
                SelectProps={{ sx: { fontWeight: 800, fontFamily: 'Cabinet Grotesk, system-ui, sans-serif' } }}
              >
                <MenuItem value="employee" sx={{ fontWeight: 700 }}>EMPLOYEE</MenuItem>
                <MenuItem value="admin" sx={{ fontWeight: 700 }}>ADMIN</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '2px solid #000' }}>
          <Button onClick={handleEditClose} sx={{ fontWeight: 800, color: '#000' }}>CANCEL</Button>
          <Button onClick={handleEditSave} variant="contained" sx={{ bgcolor: '#000', color: '#fff' }}>SAVE CHANGES</Button>
        </DialogActions>
      </Dialog>

      {/* Add Modal */}
      <Dialog 
        open={addOpen} 
        onClose={handleAddClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { bgcolor: '#fff' } }}
      >
        <form onSubmit={handleAddSubmit}>
          <DialogTitle sx={{ 
            fontFamily: 'Cabinet Grotesk, system-ui, sans-serif',
            fontWeight: 800,
            textTransform: 'uppercase',
            borderBottom: '2px solid #000',
            bgcolor: '#B7C6C2',
            color: '#000'
          }}>
            ADD NEW EMPLOYEE
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField 
                label="NAME" 
                value={addData.name} 
                onChange={(e) => setAddData({ ...addData, name: e.target.value })} 
                required
                InputLabelProps={{ sx: { fontWeight: 800 } }}
              />
              <TextField 
                label="EMAIL" 
                type="email"
                value={addData.email} 
                onChange={(e) => setAddData({ ...addData, email: e.target.value })} 
                required
                InputLabelProps={{ sx: { fontWeight: 800 } }}
              />
              <TextField 
                label="PHONE (OPTIONAL)" 
                value={addData.phone} 
                onChange={(e) => setAddData({ ...addData, phone: e.target.value })} 
                InputLabelProps={{ sx: { fontWeight: 800 } }}
              />
              <TextField 
                label="DATE OF JOINING" 
                type="date"
                InputLabelProps={{ shrink: true, sx: { fontWeight: 800 } }}
                inputProps={{ sx: { fontWeight: 700 } }}
                value={addData.dateOfJoining} 
                onChange={(e) => setAddData({ ...addData, dateOfJoining: e.target.value })} 
                required
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '2px solid #000' }}>
            <Button onClick={handleAddClose} disabled={addLoading} sx={{ fontWeight: 800, color: '#000' }}>CANCEL</Button>
            <Button type="submit" variant="contained" disabled={addLoading} sx={{ bgcolor: '#000', color: '#fff' }}>
              {addLoading ? 'CREATING...' : 'CREATE EMPLOYEE'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Success/Credentials Dialog */}
      <Dialog 
        open={!!credentials} 
        onClose={handleSuccessClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { bgcolor: '#fff', border: '4px solid #171E19' } }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Cabinet Grotesk, system-ui, sans-serif',
          fontWeight: 800,
          textTransform: 'uppercase',
          borderBottom: '2px solid #000',
          bgcolor: '#FFE17C',
          color: '#000'
        }}>
          EMPLOYEE CREATED SUCCESSFULLY!
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
            Please copy the credentials below and securely share them with the new employee.
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#d32f2f', mb: 3 }}>
            SAVE THIS NOW — THE TEMPORARY PASSWORD WILL NEVER BE SHOWN AGAIN.
          </Typography>

          {credentials && (
            <Box sx={{ mt: 3, p: 3, bgcolor: '#f5f5f5', border: '2px dashed #000', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pb: 2, borderBottom: '2px solid #e0e0e0' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#666' }}>GENERATED EMPLOYEE ID</Typography>
                  <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, mt: 0.5 }}>{credentials.employeeId}</Typography>
                </Box>
                <Tooltip title="Copy ID">
                  <IconButton onClick={() => copyToClipboard(credentials.employeeId)} sx={{ border: '2px solid #000', borderRadius: '4px', '&:hover': { bgcolor: '#FFE17C' } }}>
                    <ContentCopyIcon sx={{ color: '#000' }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#666' }}>TEMPORARY PASSWORD</Typography>
                  <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, mt: 0.5 }}>{credentials.plaintextPassword}</Typography>
                </Box>
                <Tooltip title="Copy Password">
                  <IconButton onClick={() => copyToClipboard(credentials.plaintextPassword)} sx={{ border: '2px solid #000', borderRadius: '4px', '&:hover': { bgcolor: '#FFE17C' } }}>
                    <ContentCopyIcon sx={{ color: '#000' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '2px solid #000', justifyContent: 'center' }}>
          <Button onClick={handleSuccessClose} variant="contained" sx={{ bgcolor: '#000', color: '#fff', width: '100%', py: 1.5, fontWeight: 800 }}>
            I HAVE SAVED THE CREDENTIALS
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Employees;
