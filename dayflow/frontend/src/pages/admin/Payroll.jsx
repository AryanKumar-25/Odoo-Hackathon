import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import { getPayrolls, updatePayroll, getEmployees } from '../../api/admin';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({
    employeeId: '',
    baseSalary: 0,
    allowances: 0,
    deductions: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, empRes] = await Promise.all([
        getPayrolls(),
        getEmployees()
      ]);
      setPayrolls(payRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      console.error('Error fetching payroll data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (employeeId) => {
    const existing = payrolls.find(p => p.employeeId === employeeId) || {
      employeeId,
      baseSalary: 0,
      allowances: 0,
      deductions: 0
    };
    setEditData({ ...existing });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: Number(e.target.value) || 0
    });
  };

  const handleSave = async () => {
    try {
      await updatePayroll(editData.employeeId, {
        baseSalary: editData.baseSalary,
        allowances: editData.allowances,
        deductions: editData.deductions
      });
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error updating payroll', error);
      alert('Failed to update payroll');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  // Merge employees with their payroll data for display
  const displayData = employees.map(emp => {
    const pr = payrolls.find(p => p.employeeId === emp.employeeId) || {};
    return {
      employeeId: emp.employeeId,
      name: emp.name,
      baseSalary: pr.baseSalary || 0,
      allowances: pr.allowances || 0,
      deductions: pr.deductions || 0,
      netSalary: pr.netSalary || 0
    };
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Payroll Control</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Base Salary</TableCell>
              <TableCell>Allowances</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((row) => (
              <TableRow key={row.employeeId}>
                <TableCell>{row.employeeId}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>${row.baseSalary.toFixed(2)}</TableCell>
                <TableCell>${row.allowances.toFixed(2)}</TableCell>
                <TableCell>${row.deductions.toFixed(2)}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>${row.netSalary.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleEditClick(row.employeeId)}>
                    Edit Structure
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Payroll Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Salary Structure - {editData.employeeId}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Base Salary"
                name="baseSalary"
                type="number"
                value={editData.baseSalary}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Allowances"
                name="allowances"
                type="number"
                value={editData.allowances}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deductions"
                name="deductions"
                type="number"
                value={editData.deductions}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
                Estimated Net: ${(Number(editData.baseSalary) + Number(editData.allowances) - Number(editData.deductions)).toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payroll;
