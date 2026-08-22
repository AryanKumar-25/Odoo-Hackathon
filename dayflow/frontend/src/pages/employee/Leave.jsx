import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Chip, Alert
} from '@mui/material';
import { applyLeave, getMyLeaves, getLeaveBalance } from '../../api/employee';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Apply Modal State
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'paid', startDate: '', endDate: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch leaves and balance
  const fetchData = async () => {
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        getMyLeaves(),
        getLeaveBalance()
      ]);
      setLeaves(leavesRes.data);
      setBalance(balanceRes.data);
    } catch (err) {
      console.error('Error fetching leave data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Poll for status updates every 15 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setFormData({ type: 'paid', startDate: '', endDate: '', remarks: '' });
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Client-side pre-check
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (balance) {
      if (formData.type === 'paid' && requestedDays > balance.paidDays) {
        setError(`You requested ${requestedDays} days, but only have ${balance.paidDays} Paid days available.`);
        setSubmitting(false);
        return;
      }
      if (formData.type === 'sick' && requestedDays > balance.sickDays) {
        setError(`You requested ${requestedDays} days, but only have ${balance.sickDays} Sick days available.`);
        setSubmitting(false);
        return;
      }
    }
    
    try {
      await applyLeave(formData);
      handleClose();
      fetchData(); // Immediate refresh after submission
    } catch (err) {
      console.error('Error applying for leave', err);
      setError(err.response?.data?.error || 'Failed to apply for leave. Please check your dates.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  // Ensure minimum date is today for the native date pickers
  const today = new Date().toISOString().split('T')[0];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Leave History</Typography>
          {balance && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`Paid Time Off: ${balance.paidDays} Days Available`} color="primary" variant="outlined" />
              <Chip label={`Sick Time Off: ${balance.sickDays} Days Available`} color="secondary" variant="outlined" />
            </Box>
          )}
        </Box>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Apply for Leave
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Admin Comment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">You have no leave history.</TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{leave.type}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.remarks || '-'}</TableCell>
                  <TableCell>{getStatusChip(leave.status)}</TableCell>
                  <TableCell>
                    {leave.adminComment && (
                      <Typography variant="body2" color={leave.status === 'rejected' ? 'error' : 'textSecondary'}>
                        {leave.adminComment}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Apply Leave Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                select
                label="Leave Type" 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="sick">Sick</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
              </TextField>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  fullWidth
                  label="Start Date" 
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  value={formData.startDate} 
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                  required
                />
                <TextField 
                  fullWidth
                  label="End Date" 
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: formData.startDate || today }}
                  value={formData.endDate} 
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                  required
                />
              </Box>

              <TextField 
                label="Remarks (Optional)" 
                multiline
                rows={3}
                value={formData.remarks} 
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} 
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Leave;
