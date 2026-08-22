import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Chip, Tabs, Tab
} from '@mui/material';
import { getLeaves, updateLeaveStatus } from '../../api/admin';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('pending');

  const [actionOpen, setActionOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(''); 
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
      const targetId = selectedLeave.id;
      
      setLeaves(prev => {
        if (tabValue === 'pending') {
          return prev.filter(l => l.id !== targetId);
        }
        return prev.map(l => 
          l.id === targetId 
            ? { ...l, status: actionType, adminComment } 
            : l
        );
      });

      handleActionClose();
      await updateLeaveStatus(targetId, actionType, adminComment);
      
    } catch (err) {
      console.error('Error updating leave status', err);
      fetchLeaves();
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="APPROVED" sx={{ bgcolor: '#FFE17C', color: '#000', border: '2px solid #000' }} size="small" />;
      case 'rejected':
        return <Chip label="REJECTED" sx={{ bgcolor: '#171E19', color: '#fff', border: '2px solid #000' }} size="small" />;
      default:
        return <Chip label="PENDING" sx={{ bgcolor: '#fff', color: '#000', border: '2px solid #000', fontWeight: 800 }} size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>LEAVE APPROVALS</Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19' }}>
          Review and manage employee time-off requests.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: '2px solid #000', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{
            '& .MuiTab-root': {
              border: '2px solid transparent',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              mr: 1,
              px: 3,
              opacity: 1,
            },
            '& .Mui-selected': {
              bgcolor: '#fff',
              border: '2px solid #000',
              borderBottom: '2px solid #fff',
              mb: '-2px',
              color: '#000 !important',
              zIndex: 1
            }
          }}
        >
          <Tab label="PENDING" value="pending" />
          <Tab label="APPROVED" value="approved" />
          <Tab label="REJECTED" value="rejected" />
          <Tab label="ALL REQUESTS" value="all" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, p: 4, bgcolor: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '8px 8px 0 #000' }}>
          <CircularProgress sx={{ color: '#000' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#fff' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="h3" sx={{ mb: 2 }}>ALL CAUGHT UP</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {tabValue === 'pending' 
                        ? "No pending leave requests! You're good to go." 
                        : `No ${tabValue !== 'all' ? tabValue : ''} leave requests found.`}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="800">{leave.employeeName}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#666' }}>{leave.employeeId}</Typography>
                    </TableCell>
                    <TableCell sx={{ textTransform: 'uppercase', fontWeight: 800 }}>{leave.type}</TableCell>
                    <TableCell>
                      {leave.balance ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {leave.type === 'paid' && <Chip size="small" label={`PAID: ${leave.balance.paidDays}`} sx={{ bgcolor: '#FFE17C', fontWeight: 800 }} />}
                          {leave.type === 'sick' && <Chip size="small" label={`SICK: ${leave.balance.sickDays}`} sx={{ bgcolor: '#B7C6C2', fontWeight: 800 }} />}
                          {leave.type === 'unpaid' && <Chip size="small" label={`UNPAID: ${leave.balance.unpaidUsed}`} sx={{ bgcolor: '#eee', fontWeight: 800 }} />}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {leave.remarks || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(leave.status)}</TableCell>
                    <TableCell>
                      {leave.status === 'pending' ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            size="small" 
                            onClick={() => handleActionClick(leave, 'approved')}
                            sx={{ bgcolor: '#FFE17C', color: '#000', '&:hover': { bgcolor: '#e5ca6f' } }}
                          >
                            APPROVE
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => handleActionClick(leave, 'rejected')}
                            sx={{ bgcolor: '#fff' }}
                          >
                            REJECT
                          </Button>
                        </Box>
                      ) : (
                        leave.adminComment && (
                          <Typography variant="caption" sx={{ display: 'block', maxWidth: 150, fontWeight: 700, fontStyle: 'italic', bgcolor: '#f5f5f5', p: 1, borderRadius: '4px', border: '1px solid #000' }}>
                            {leave.adminComment}
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

      {/* Action Dialog */}
      <Dialog 
        open={actionOpen} 
        onClose={handleActionClose} 
        fullWidth 
        maxWidth="xs"
        PaperProps={{
          sx: {
            bgcolor: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Cabinet Grotesk, system-ui, sans-serif',
          fontWeight: 800,
          textTransform: 'uppercase',
          borderBottom: '2px solid #000',
          bgcolor: actionType === 'approved' ? '#FFE17C' : '#171E19',
          color: actionType === 'approved' ? '#000' : '#fff'
        }}>
          {actionType} REQUEST
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 3 }}>
            You are about to <strong>{actionType === 'approved' ? 'approve' : 'reject'}</strong> this leave request for <strong>{selectedLeave?.employeeName}</strong>.
          </Typography>
          <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>
            Admin Comment (Optional)
          </Typography>
          <TextField 
            fullWidth
            multiline
            rows={3}
            value={adminComment} 
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder={actionType === 'approved' ? "e.g. Enjoy your time off!" : "e.g. We are short staffed this week."}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '2px solid #000' }}>
          <Button onClick={handleActionClose} disabled={submitting} sx={{ fontWeight: 800, color: '#000' }}>
            CANCEL
          </Button>
          <Button 
            onClick={handleActionConfirm} 
            variant="contained" 
            disabled={submitting}
            sx={{ 
              bgcolor: actionType === 'approved' ? '#FFE17C' : '#171E19',
              color: actionType === 'approved' ? '#000' : '#fff',
              '&:hover': {
                bgcolor: actionType === 'approved' ? '#e5ca6f' : '#000',
              }
            }}
          >
            {submitting ? 'UPDATING...' : `CONFIRM ${actionType.toUpperCase()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leaves;
