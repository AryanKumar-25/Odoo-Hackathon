import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, TextField, IconButton, Chip 
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import { getAttendance } from '../../api/admin';

const STANDARD_WORK_HOURS = 8; // Assumed standard workday length

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Helpers to calculate today boundary
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const res = await getAttendance({ date: dateStr });
      setRecords(res.data);
    } catch (error) {
      console.error('Error fetching attendance', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentDate]);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    
    // Disable navigating into the future
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);
    if (next <= endOfToday) {
      setCurrentDate(next);
    }
  };

  const isNextDayDisabled = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);
    return next > endOfToday;
  };

  // Client-side filtering based on employee name or ID
  const filteredRecords = records.filter(rec => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (rec.name && rec.name.toLowerCase().includes(term)) ||
      (rec.employeeId && rec.employeeId.toLowerCase().includes(term))
    );
  });

  return (
    <Box>
      {/* Sub-header row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Attendance</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', px: 1, borderRadius: 1, border: '1px solid #ccc' }}>
          <SearchIcon color="action" />
          <TextField 
            variant="standard"
            placeholder="Search by name or ID"
            InputProps={{ disableUnderline: true }}
            sx={{ ml: 1, width: 250 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </Box>

      {/* Controls row */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handlePrevDay}><ArrowBackIosIcon fontSize="small" /></IconButton>
        <Typography variant="h6" sx={{ mx: 2, minWidth: 200, textAlign: 'center' }}>
          {currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton onClick={handleNextDay} disabled={isNextDayDisabled()}><ArrowForwardIosIcon fontSize="small" /></IconButton>
        <Chip label="Day View" color="primary" variant="outlined" sx={{ ml: 3 }} />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Emp ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell align="right">Work Hours</TableCell>
                <TableCell align="right">Extra hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  
                  // Compute Status
                  let displayStatus = rec.status;
                  
                  // Logic per spec:
                  // 1. "no_record": zero attendance data (weekends, future, past before start).
                  // 2. "absent": normal working day without check-in.
                  // Since we are strictly relying on what the backend gives us, if it's null, we calculate it here.
                  
                  // If no record exists...
                  if (!displayStatus) {
                    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
                    
                    // Note for Payroll module: Ensure leave module injects 'leave' or 'paid_leave' into the DB for these days.
                    // For now, if no record and it's a weekday, it's 'absent'. If weekend, 'no_record'.
                    if (isWeekend) {
                      displayStatus = 'no_record';
                    } else if (currentDate <= today) {
                      displayStatus = 'absent';
                    } else {
                      displayStatus = 'no_record'; // Shouldn't hit this due to future date block, but safe fallback
                    }
                  }

                  let workHours = 0;
                  let extraHours = 0;
                  let workHoursDisplay = '-';
                  let extraHoursDisplay = '-';

                  if (rec.checkIn) {
                    if (rec.checkOut) {
                      const inTime = new Date(rec.checkIn);
                      const outTime = new Date(rec.checkOut);
                      const diffMs = outTime - inTime;
                      workHours = diffMs / (1000 * 60 * 60);
                      
                      extraHours = Math.max(0, workHours - STANDARD_WORK_HOURS);
                      
                      workHoursDisplay = workHours.toFixed(2);
                      extraHoursDisplay = extraHours.toFixed(2);
                    } else {
                      workHoursDisplay = 'In progress';
                    }
                  }

                  return (
                    <TableRow key={rec.employeeId}>
                      <TableCell>{rec.employeeId}</TableCell>
                      <TableCell>{rec.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={displayStatus === 'no_record' ? 'No Record' : displayStatus} 
                          size="small" 
                          color={
                            displayStatus === 'present' ? 'success' : 
                            displayStatus === 'absent' ? 'error' : 
                            displayStatus === 'leave' ? 'warning' : 'default'
                          } 
                        />
                      </TableCell>
                      <TableCell>{(displayStatus === 'absent' || displayStatus === 'leave' || displayStatus === 'no_record' || !rec.checkIn) ? '-' : new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>{(displayStatus === 'absent' || displayStatus === 'leave' || displayStatus === 'no_record' || !rec.checkOut) ? '-' : new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell align="right">{workHoursDisplay}</TableCell>
                      <TableCell align="right">{extraHoursDisplay}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No employees found for this date.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Attendance;
