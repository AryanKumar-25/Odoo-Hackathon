import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, Grid
} from '@mui/material';
import { getEmployeePayroll } from '../../api/payroll';
import { useAuth } from '../../context/AuthContext';

const EmployeePayroll = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await getEmployeePayroll(user.employeeId);
        setRecords(res.data);
      } catch (err) {
        console.error('Failed to fetch payroll', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [user.employeeId]);

  const handleOpen = (record) => {
    setSelectedRecord(record);
  };

  const handleClose = () => {
    setSelectedRecord(null);
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" mb={3}>My Payslips</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Payable Days</TableCell>
              <TableCell>Gross Salary</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No payslips found.</TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{getMonthName(r.month)} {r.year}</TableCell>
                  <TableCell>{r.payableDays}</TableCell>
                  <TableCell>₹{Number(r.grossSalary).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(r.netSalary).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={r.status} color={r.status === 'finalized' ? 'success' : 'default'} size="small" sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => handleOpen(r)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(selectedRecord)} onClose={handleClose} fullWidth maxWidth="sm">
        {selectedRecord && (
          <>
            <DialogTitle>Payslip: {getMonthName(selectedRecord.month)} {selectedRecord.year}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Payable Days</Typography>
                  <Typography gutterBottom>{selectedRecord.payableDays}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Unpaid Leave Days</Typography>
                  <Typography gutterBottom>{selectedRecord.unpaidLeaveDays}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" mt={2}>Earnings</Typography>
                </Grid>
                {Array.isArray(selectedRecord.componentBreakdown) && selectedRecord.componentBreakdown.map((c, i) => (
                  <React.Fragment key={i}>
                    <Grid item xs={6}><Typography>{c.name}</Typography></Grid>
                    <Grid item xs={6}><Typography align="right">₹{Number(c.value).toLocaleString()}</Typography></Grid>
                  </React.Fragment>
                ))}
                <Grid item xs={6}><Typography fontWeight="bold">Total Gross</Typography></Grid>
                <Grid item xs={6}><Typography align="right" fontWeight="bold">₹{Number(selectedRecord.grossSalary).toLocaleString()}</Typography></Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" mt={2}>Deductions</Typography>
                </Grid>
                <Grid item xs={6}><Typography>PF Contribution</Typography></Grid>
                <Grid item xs={6}><Typography align="right">₹{Number(selectedRecord.pfDeduction).toLocaleString()}</Typography></Grid>
                <Grid item xs={6}><Typography>Professional Tax</Typography></Grid>
                <Grid item xs={6}><Typography align="right">₹{Number(selectedRecord.professionalTax).toLocaleString()}</Typography></Grid>

                <Grid item xs={12} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Net Salary</Typography>
                    <Typography variant="h5" color="primary">₹{Number(selectedRecord.netSalary).toLocaleString()}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EmployeePayroll;
