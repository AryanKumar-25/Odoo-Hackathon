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
      // Save any pending edits before finalizing
      if (selectedRecord && selectedRecord.id === id) {
        await updatePayroll(id, editData);
      }
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
    return date.toLocaleString('default', { month: 'long', timeZone: 'UTC' }).toUpperCase();
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>PAYROLL</Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19' }}>
          Generate and manage employee compensation.
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, alignItems: 'center', p: 3, bgcolor: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0 #000' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontWeight: 800 }}>MONTH</InputLabel>
          <Select 
            value={selectedMonth} 
            label="MONTH" 
            onChange={e => setSelectedMonth(e.target.value)}
            sx={{ fontWeight: 800, fontFamily: 'Cabinet Grotesk, system-ui, sans-serif' }}
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <MenuItem key={m} value={m} sx={{ fontWeight: 700 }}>{getMonthName(m)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ fontWeight: 800 }}>YEAR</InputLabel>
          <Select 
            value={selectedYear} 
            label="YEAR" 
            onChange={e => setSelectedYear(e.target.value)}
            sx={{ fontWeight: 800, fontFamily: 'Cabinet Grotesk, system-ui, sans-serif' }}
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <MenuItem key={y} value={y} sx={{ fontWeight: 700 }}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          onClick={() => handleGenerate()} 
          disabled={isGenerating}
          sx={{ bgcolor: '#FFE17C', color: '#000', py: 1.5, px: 3, fontSize: '1rem', '&:hover': { bgcolor: '#e5ca6f' } }}
        >
          {isGenerating ? 'GENERATING...' : `GENERATE ALL FOR ${getMonthName(selectedMonth)} ${selectedYear}`}
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ bgcolor: '#fff' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>EMPLOYEE</TableCell>
              <TableCell>PAYABLE DAYS</TableCell>
              <TableCell>GROSS SALARY</TableCell>
              <TableCell>NET SALARY</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress sx={{ color: '#000' }} />
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>NO RECORDS</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    No payroll records generated for this period yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="800">{r.employeeName}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#666' }}>{r.employeeId}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{r.payableDays}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {r.grossSalary === '-' ? '-' : `₹${Number(r.grossSalary).toLocaleString()}`}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {r.netSalary === '-' ? '-' : `₹${Number(r.netSalary).toLocaleString()}`}
                  </TableCell>
                  <TableCell>
                    {r.status === 'finalized' && <Chip label="FINALIZED" sx={{ bgcolor: '#B7C6C2', color: '#000', border: '2px solid #000', fontWeight: 800 }} size="small" />}
                    {r.status === 'draft' && <Chip label="DRAFT" sx={{ bgcolor: '#FFE17C', color: '#000', border: '2px solid #000', fontWeight: 800 }} size="small" />}
                    {r.status === 'Not Generated' && <Chip label="NOT GENERATED" sx={{ bgcolor: '#eee', color: '#000', border: '2px solid #000', fontWeight: 800 }} size="small" />}
                  </TableCell>
                  <TableCell align="right">
                    {r.status === 'Not Generated' ? (
                      <Button variant="contained" size="small" onClick={() => handleGenerate(r.employeeId)} disabled={isGenerating} sx={{ bgcolor: '#000', color: '#fff' }}>
                        GENERATE
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small" onClick={() => handleOpenEdit(r)} sx={{ bgcolor: '#fff' }}>
                        {r.status === 'draft' ? 'REVIEW / EDIT' : 'VIEW'}
                      </Button>
                    )}
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
              bgcolor: selectedRecord.status === 'draft' ? '#FFE17C' : '#B7C6C2',
              color: '#000'
            }}>
              {selectedRecord.status === 'draft' ? 'REVIEW PAYSLIP' : 'PAYSLIP DETAILS'}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                {selectedRecord.employeeName} • {getMonthName(selectedRecord.month)} {selectedRecord.year}
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
                
                {selectedRecord.status === 'draft' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Gross Salary</Typography>
                      <TextField 
                        fullWidth type="number"
                        value={editData.grossSalary || 0}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditData(prev => ({
                            ...prev, 
                            grossSalary: val,
                            netSalary: Math.max(0, val - (prev.pfDeduction || 0) - (prev.professionalTax || 0))
                          }));
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>PF Deduction</Typography>
                      <TextField 
                        fullWidth type="number"
                        value={editData.pfDeduction || 0}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditData(prev => ({
                            ...prev, 
                            pfDeduction: val,
                            netSalary: Math.max(0, (prev.grossSalary || 0) - val - (prev.professionalTax || 0))
                          }));
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Professional Tax</Typography>
                      <TextField 
                        fullWidth type="number"
                        value={editData.professionalTax || 0}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditData(prev => ({
                            ...prev, 
                            professionalTax: val,
                            netSalary: Math.max(0, (prev.grossSalary || 0) - (prev.pfDeduction || 0) - val)
                          }));
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Net Salary</Typography>
                      <TextField 
                        fullWidth type="number"
                        value={editData.netSalary || 0}
                        onChange={e => setEditData({...editData, netSalary: Number(e.target.value)})}
                        helperText="Net is typically Gross - PF - PT"
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} sx={{ my: 2 }}>
                      <Box sx={{ p: 3, bgcolor: '#f5f5f5', border: '2px solid #000', borderRadius: '8px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>TOTAL GROSS</Typography>
                          <Typography variant="h5">₹{Number(selectedRecord.grossSalary).toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>PF CONTRIBUTION</Typography>
                          <Typography variant="h6">₹{Number(selectedRecord.pfDeduction).toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                          <Typography variant="body1" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>PROFESSIONAL TAX</Typography>
                          <Typography variant="h6">₹{Number(selectedRecord.professionalTax).toLocaleString()}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '2px solid #000' }}>
                          <Typography variant="h4">NET SALARY</Typography>
                          <Typography variant="h3" sx={{ color: '#000' }}>₹{Number(selectedRecord.netSalary).toLocaleString()}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '2px solid #000' }}>
              <Button onClick={handleClose} sx={{ fontWeight: 800, color: '#000' }}>CLOSE</Button>
              {selectedRecord.status === 'draft' && (
                <>
                  <Button onClick={handleSave} variant="outlined" sx={{ bgcolor: '#fff' }}>SAVE DRAFT</Button>
                  <Button onClick={() => handleFinalize(selectedRecord.id)} variant="contained" sx={{ bgcolor: '#000', color: '#fff' }}>FINALIZE PAYSLIP</Button>
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
