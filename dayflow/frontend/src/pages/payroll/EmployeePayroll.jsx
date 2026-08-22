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
    return date.toLocaleString('default', { month: 'long', timeZone: 'UTC' }).toUpperCase();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, p: 4, bgcolor: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '8px 8px 0 #000' }}><CircularProgress sx={{ color: '#000' }} /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>MY PAYSLIPS</Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19' }}>
          View and download your monthly compensation details.
        </Typography>
      </Box>
      
      <TableContainer component={Paper} sx={{ bgcolor: '#fff' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PERIOD</TableCell>
              <TableCell>PAYABLE DAYS</TableCell>
              <TableCell>GROSS SALARY</TableCell>
              <TableCell>NET SALARY</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>NO PAYSLIPS FOUND</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    You don't have any generated payslips yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{getMonthName(r.month)} {r.year}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{r.payableDays}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>₹{Number(r.grossSalary).toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>₹{Number(r.netSalary).toLocaleString()}</TableCell>
                  <TableCell>
                    {r.status === 'finalized' && <Chip label="FINALIZED" sx={{ bgcolor: '#B7C6C2', color: '#000', border: '2px solid #000', fontWeight: 800 }} size="small" />}
                    {r.status === 'draft' && <Chip label="DRAFT" sx={{ bgcolor: '#FFE17C', color: '#000', border: '2px solid #000', fontWeight: 800 }} size="small" />}
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => handleOpen(r)} sx={{ bgcolor: '#fff' }}>
                      VIEW DETAILS
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={Boolean(selectedRecord)} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { bgcolor: '#fff' } }}
      >
        {selectedRecord && (
          <>
            <DialogTitle sx={{ 
              fontFamily: 'Cabinet Grotesk, system-ui, sans-serif',
              fontWeight: 800,
              textTransform: 'uppercase',
              borderBottom: '2px solid #000',
              bgcolor: '#FFE17C',
              color: '#000'
            }}>
              PAYSLIP DETAILS
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                {getMonthName(selectedRecord.month)} {selectedRecord.year}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Payable Days</Typography>
                  <Typography variant="h5">{selectedRecord.payableDays}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Unpaid Leave Days</Typography>
                  <Typography variant="h5">{selectedRecord.unpaidLeaveDays}</Typography>
                </Grid>
                
                <Grid item xs={12} sx={{ my: 1 }}>
                  <Typography variant="h4" sx={{ mb: 2, fontSize: '1.25rem', borderBottom: '2px solid #000', pb: 1 }}>EARNINGS</Typography>
                  {Array.isArray(selectedRecord.componentBreakdown) && selectedRecord.componentBreakdown.map((c, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{c.name}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>₹{Number(c.value).toLocaleString()}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '2px dashed #000' }}>
                    <Typography variant="body1" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>TOTAL GROSS</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>₹{Number(selectedRecord.grossSalary).toLocaleString()}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h4" sx={{ mb: 2, fontSize: '1.25rem', borderBottom: '2px solid #000', pb: 1 }}>DEDUCTIONS</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>PF CONTRIBUTION</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>₹{Number(selectedRecord.pfDeduction).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>PROFESSIONAL TAX</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>₹{Number(selectedRecord.professionalTax).toLocaleString()}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ p: 3, bgcolor: '#f5f5f5', border: '2px solid #000', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4">NET SALARY</Typography>
                    <Typography variant="h3" sx={{ color: '#000' }}>₹{Number(selectedRecord.netSalary).toLocaleString()}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '2px solid #000' }}>
              <Button onClick={handleClose} sx={{ fontWeight: 800, color: '#000' }}>CLOSE</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EmployeePayroll;
