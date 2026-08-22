import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Chip, Tabs, Tab
} from '@mui/material';
import { getLeaves, updateLeaveStatus } from '../../api/admin';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'

  // Action Dialog State
  const [actionOpen, setActionOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approved' or 'rejected'
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async (status = tabValue) => {
    try {
      setLoading(true);
      const params = status === 'all' ? {} : { status };
      const res = await getLeaves(params);
      setLeaves(res.data);
    } catch (err) {
      console.error('Error fetching leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves(tabValue);
  }, [tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleActionClick = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setAdminComment('');
    setActionOpen(true);
  };

  const handleActionClose = () => {
    setActionOpen(false);
    setSelectedLeave(null);
  };

  const handleActionConfirm = async () => {
    if (!selectedLeave) return;
    
    setSubmitting(true);
    try {
      // Optimistic update
      const targetId = selectedLeave.id;
      
      setLeaves(prev => {
        if (tabValue === 'pending') {
          // If viewing pending, remove it from the list
          return prev.filter(l => l.id !== targetId);
        }
        // If viewing all, update the status and comment inline
        return prev.map(l => 
          l.id === targetId 
            ? { ...l, status: actionType, adminComment } 
            : l
        );
      });

      handleActionClose();

      // Make the actual API call in the background
      await updateLeaveStatus(targetId, actionType, adminComment);
      
    } catch (err) {
      console.error('Error updating leave status', err);
      // Revert optimistic update on failure by refetching
      fetchLeaves();
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Leave Approvals</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Pending" value="pending" />
          <Tab label="Approved" value="approved" />
          <Tab label="Rejected" value="rejected" />
          <Tab label="All Requests" value="all" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {tabValue === 'pending' 
                      ? "No pending leave requests! You're all caught up." 
                      : `No ${tabValue !== 'all' ? tabValue : ''} leave requests found.`}
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{leave.employeeName}</Typography>
                      <Typography variant="caption" color="textSecondary">{leave.employeeId}</Typography>
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{leave.type}</TableCell>
                    <TableCell>
                      {leave.balance ? (
                        <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap' }}>
                          {leave.type === 'paid' && <Box component="span" color="primary.main">Paid: {leave.balance.paidDays}</Box>}
                          {leave.type === 'sick' && <Box component="span" color="secondary.main">Sick: {leave.balance.sickDays}</Box>}
                          {leave.type === 'unpaid' && <Box component="span" color="text.secondary">Unpaid Used: {leave.balance.unpaidUsed}</Box>}
                        </Typography>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.remarks || '-'}</TableCell>
                    <TableCell>{getStatusChip(leave.status)}</TableCell>
                    <TableCell>
                      {leave.status === 'pending' ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small" 
                            onClick={() => handleActionClick(leave, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small" 
                            onClick={() => handleActionClick(leave, 'rejected')}
                          >
                            Reject
                          </Button>
                        </Box>
                      ) : (
                        leave.adminComment && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', maxWidth: 150 }}>
                            Note: {leave.adminComment}
                          </Typography>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Approve/Reject Confirmation Dialog */}
      <Dialog open={actionOpen} onClose={handleActionClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textTransform: 'capitalize', color: actionType === 'approved' ? 'success.main' : 'error.main' }}>
          {actionType} Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Are you sure you want to {actionType === 'approved' ? 'approve' : 'reject'} this leave request for <strong>{selectedLeave?.employeeName}</strong>?
          </Typography>
          <TextField 
            fullWidth
            label="Admin Comment (Optional)" 
            multiline
            rows={2}
            value={adminComment} 
            onChange={(e) => setAdminComment(e.target.value)}
            sx={{ mt: 2 }}
            placeholder={actionType === 'approved' ? "e.g. Enjoy your time off!" : "e.g. We are short staffed this week."}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionClose} disabled={submitting}>Cancel</Button>
          <Button 
            onClick={handleActionConfirm} 
            variant="contained" 
            color={actionType === 'approved' ? 'success' : 'error'}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : `Confirm ${actionType}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leaves;
