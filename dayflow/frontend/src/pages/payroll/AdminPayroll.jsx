import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, 
  Grid, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { getAdminPayroll, generatePayroll, updatePayroll, finalizePayroll } from '../../api/payroll';

const AdminPayroll = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editData, setEditData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await getAdminPayroll(selectedMonth, selectedYear);
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to fetch payroll', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, selectedYear]);

  const handleGenerate = async (employeeId = null) => {
    try {
      setIsGenerating(true);
      await generatePayroll(selectedMonth, selectedYear, employeeId);
      fetchPayroll();
    } catch (err) {
      console.error(err);
      alert('Failed to generate payroll');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEdit = (record) => {
    setSelectedRecord(record);
    setEditData({
      grossSalary: record.grossSalary,
      pfDeduction: record.pfDeduction,
      professionalTax: record.professionalTax,
      netSalary: record.netSalary
    });
  };

  const handleClose = () => {
    setSelectedRecord(null);
  };

  const handleSave = async () => {
    try {
      await updatePayroll(selectedRecord.id, editData);
      handleClose();
      fetchPayroll();
    } catch (err) {
      console.error(err);
      alert('Failed to update record');
    }
  };

  const handleFinalize = async (id) => {
    if (!window.confirm("Are you sure you want to finalize this payslip? It cannot be edited afterward.")) return;
    try {
      await finalizePayroll(id);
      fetchPayroll();
      if (selectedRecord?.id === id) handleClose();
    } catch (err) {
      console.error(err);
      alert('Failed to finalize record');
    }
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>Payroll Management</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Month</InputLabel>
          <Select value={selectedMonth} label="Month" onChange={e => setSelectedMonth(e.target.value)}>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <MenuItem key={m} value={m}>{getMonthName(m)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select value={selectedYear} label="Year" onChange={e => setSelectedYear(e.target.value)}>
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleGenerate()} 
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : `Generate All for ${getMonthName(selectedMonth)} ${selectedYear}`}
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Payable Days</TableCell>
              <TableCell>Gross Salary</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No records generated for this period.</TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{r.employeeName}</Typography>
                    <Typography variant="caption" color="textSecondary">{r.employeeId}</Typography>
                  </TableCell>
                  <TableCell>{r.payableDays}</TableCell>
                  <TableCell>
                    {r.grossSalary === '-' ? '-' : `₹${Number(r.grossSalary).toLocaleString()}`}
                  </TableCell>
                  <TableCell>
                    {r.netSalary === '-' ? '-' : `₹${Number(r.netSalary).toLocaleString()}`}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={r.status} 
                      color={r.status === 'finalized' ? 'success' : r.status === 'draft' ? 'warning' : 'default'} 
                      size="small" 
                      sx={{ textTransform: 'capitalize' }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {r.status === 'Not Generated' ? (
                      <Button variant="contained" size="small" onClick={() => handleGenerate(r.employeeId)} disabled={isGenerating}>
                        Generate
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small" onClick={() => handleOpenEdit(r)}>
                        {r.status === 'draft' ? 'Review / Edit' : 'View'}
                      </Button>
                    )}
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
            <DialogTitle>
              {selectedRecord.status === 'draft' ? 'Review Payslip' : 'Payslip Details'}
              <Typography variant="subtitle2" color="textSecondary">
                {selectedRecord.employeeName} • {getMonthName(selectedRecord.month)} {selectedRecord.year}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Payable Days</Typography>
                  <Typography gutterBottom>{selectedRecord.payableDays}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Unpaid Leave Days</Typography>
                  <Typography gutterBottom>{selectedRecord.unpaidLeaveDays}</Typography>
                </Grid>
                
                {selectedRecord.status === 'draft' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth label="Gross Salary" type="number"
                        value={editData.grossSalary || 0}
                        onChange={e => setEditData({...editData, grossSalary: Number(e.target.value)})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth label="PF Deduction" type="number"
                        value={editData.pfDeduction || 0}
                        onChange={e => setEditData({...editData, pfDeduction: Number(e.target.value)})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth label="Professional Tax" type="number"
                        value={editData.professionalTax || 0}
                        onChange={e => setEditData({...editData, professionalTax: Number(e.target.value)})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth label="Net Salary" type="number"
                        value={editData.netSalary || 0}
                        onChange={e => setEditData({...editData, netSalary: Number(e.target.value)})}
                        helperText="Net is typically Gross - PF - PT"
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={6}><Typography>Total Gross</Typography></Grid>
                    <Grid item xs={6}><Typography align="right" fontWeight="bold">₹{Number(selectedRecord.grossSalary).toLocaleString()}</Typography></Grid>

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
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
              {selectedRecord.status === 'draft' && (
                <>
                  <Button onClick={handleSave} color="primary" variant="outlined">Save Draft</Button>
                  <Button onClick={() => handleFinalize(selectedRecord.id)} color="success" variant="contained">Finalize</Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminPayroll;
