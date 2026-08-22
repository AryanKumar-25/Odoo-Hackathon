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
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'paid', startDate: '', endDate: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      fetchData(); 
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
        return <Chip label="APPROVED" sx={{ bgcolor: '#B7C6C2', color: '#000', border: '2px solid #000', fontWeight: 800 }} size="small" />;
      case 'rejected':
        return <Chip label="REJECTED" sx={{ bgcolor: '#171E19', color: '#fff', border: '2px solid #000', fontWeight: 800 }} size="small" />;
      default:
        return <Chip label="PENDING" sx={{ bgcolor: '#FFE17C', color: '#000', border: '2px solid #000', fontWeight: 800 }} size="small" />;
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, p: 4, bgcolor: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '8px 8px 0 #000' }}><CircularProgress sx={{ color: '#000' }} /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>LEAVE REQUESTS</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19', mb: 2 }}>
            Manage your time off and leave balances.
          </Typography>
          {balance && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`PAID: ${balance.paidDays} DAYS`} sx={{ bgcolor: '#fff', border: '2px solid #000', borderRadius: '8px', fontWeight: 800 }} />
              <Chip label={`SICK: ${balance.sickDays} DAYS`} sx={{ bgcolor: '#fff', border: '2px solid #000', borderRadius: '8px', fontWeight: 800 }} />
            </Box>
          )}
        </Box>
        <Button 
          variant="contained" 
          onClick={handleOpen}
          sx={{ bgcolor: '#FFE17C', color: '#000', py: 1.5, px: 3, fontSize: '1.1rem', '&:hover': { bgcolor: '#e5ca6f' } }}
        >
          APPLY FOR LEAVE
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#fff' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>TYPE</TableCell>
              <TableCell>START DATE</TableCell>
              <TableCell>END DATE</TableCell>
              <TableCell>REMARKS</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell>ADMIN COMMENT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>NO LEAVE HISTORY</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    You haven't requested any leaves yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id} hover>
                  <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase' }}>{leave.type}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{new Date(leave.startDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{new Date(leave.endDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
                  <TableCell>{leave.remarks || '-'}</TableCell>
                  <TableCell>{getStatusChip(leave.status)}</TableCell>
                  <TableCell>
                    {leave.adminComment && (
                      <Typography variant="body2" sx={{ fontWeight: 700, color: leave.status === 'rejected' ? '#d32f2f' : '#666' }}>
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

      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { bgcolor: '#fff' } }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ 
            fontFamily: 'Cabinet Grotesk, system-ui, sans-serif',
            fontWeight: 800,
            textTransform: 'uppercase',
            borderBottom: '2px solid #000',
            bgcolor: '#FFE17C',
            color: '#000'
          }}>
            APPLY FOR LEAVE
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, border: '2px solid #000', borderRadius: '8px', fontWeight: 700 }}
              >
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField 
                select
                label="LEAVE TYPE" 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                InputLabelProps={{ sx: { fontWeight: 800 } }}
                SelectProps={{ sx: { fontWeight: 800, fontFamily: 'Cabinet Grotesk, system-ui, sans-serif' } }}
              >
                <MenuItem value="paid" sx={{ fontWeight: 700 }}>PAID</MenuItem>
                <MenuItem value="sick" sx={{ fontWeight: 700 }}>SICK</MenuItem>
                <MenuItem value="unpaid" sx={{ fontWeight: 700 }}>UNPAID</MenuItem>
              </TextField>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  fullWidth
                  label="START DATE" 
                  type="date"
                  InputLabelProps={{ shrink: true, sx: { fontWeight: 800 } }}
                  inputProps={{ min: today, sx: { fontWeight: 700 } }}
                  value={formData.startDate} 
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                  required
                />
                <TextField 
                  fullWidth
                  label="END DATE" 
                  type="date"
                  InputLabelProps={{ shrink: true, sx: { fontWeight: 800 } }}
                  inputProps={{ min: formData.startDate || today, sx: { fontWeight: 700 } }}
                  value={formData.endDate} 
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                  required
                />
              </Box>

              <TextField 
                label="REMARKS (OPTIONAL)" 
                multiline
                rows={3}
                value={formData.remarks} 
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} 
                InputLabelProps={{ sx: { fontWeight: 800 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '2px solid #000' }}>
            <Button onClick={handleClose} disabled={submitting} sx={{ fontWeight: 800, color: '#000' }}>
              CANCEL
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitting}
              sx={{ bgcolor: '#000', color: '#fff' }}
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Leave;
