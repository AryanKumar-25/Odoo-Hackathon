import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip
} from '@mui/material';
import { getLeaves, updateLeaveStatus } from '../../api/admin';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await getLeaves();
      setLeaves(res.data);
    } catch (error) {
      console.error('Error fetching leaves', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleActionClick = (leave, status) => {
    setSelectedLeave(leave);
    setActionStatus(status);
    setAdminComment(leave.adminComment || '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLeave(null);
    setActionStatus('');
    setAdminComment('');
  };

  const handleSubmit = async () => {
    try {
      await updateLeaveStatus(selectedLeave.id, actionStatus, adminComment);
      fetchLeaves();
      handleClose();
    } catch (error) {
      console.error('Error updating leave status', error);
      alert('Failed to update leave request');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Leave Approvals Queue</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.employeeId}</TableCell>
                <TableCell>{leave.type}</TableCell>
                <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{leave.remarks}</TableCell>
                <TableCell>
                  <Chip 
                    label={leave.status} 
                    color={leave.status === 'pending' ? 'warning' : leave.status === 'approved' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {leave.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" color="success" size="small" onClick={() => handleActionClick(leave, 'approved')}>
                        Approve
                      </Button>
                      <Button variant="contained" color="error" size="small" onClick={() => handleActionClick(leave, 'rejected')}>
                        Reject
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approval/Rejection Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{actionStatus === 'approved' ? 'Approve' : 'Reject'} Leave Request</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            You are about to {actionStatus} the leave request for Employee {selectedLeave?.employeeId}.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Admin Comment (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color={actionStatus === 'approved' ? 'success' : 'error'}
          >
            Confirm {actionStatus}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leaves;
