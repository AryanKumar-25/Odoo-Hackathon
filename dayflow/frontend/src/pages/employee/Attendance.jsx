import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, IconButton, Paper, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Chip 
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getMyAttendance, checkIn, checkOut } from '../../api/employee';

// Assumed Standard Workday Length (for Payroll teammate to use as well)
const STANDARD_WORK_HOURS = 8;

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive month string (YYYY-MM) for API
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const monthString = `${year}-${month}`;

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendance(monthString);
      setRecords(res.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [monthString]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const handleCheckIn = async () => {
    try {
      await checkIn();
      fetchAttendance(); // refresh records
    } catch (error) {
      alert(error.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      fetchAttendance(); // refresh records
    } catch (error) {
      alert(error.response?.data?.error || 'Check-out failed');
    }
  };

  // Determine if today's checkin/checkout buttons should be enabled
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date.startsWith(todayStr));
  const hasCheckedInToday = !!(todayRecord && todayRecord.checkIn);
  const hasCheckedOutToday = !!(todayRecord && todayRecord.checkOut);

  // Generate days for the current month
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const monthDays = [];
  
  let daysPresent = 0;
  let leavesCount = 0;
  let totalWorkingHours = 0;

  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);

  for (let i = daysInMonth; i >= 1; i--) {
    const dayDate = new Date(Date.UTC(year, currentDate.getMonth(), i));
    if (dayDate > today) continue;
    
    const dayStr = dayDate.toISOString().split('T')[0];
    
    let record = records.find(r => r.date.startsWith(dayStr));
    let status = record ? record.status : null;
    
    // Auto-mark absent if past day and no record exists
    if (!record && dayDate < new Date().setUTCHours(0,0,0,0)) {
      status = 'absent';
    }

    let workHours = 0;
    let extraHours = 0;
    let workHoursDisplay = '-';
    let extraHoursDisplay = '-';

    if (record && record.checkIn) {
      if (record.checkOut) {
        const inTime = new Date(record.checkIn);
        const outTime = new Date(record.checkOut);
        const diffMs = outTime - inTime;
        workHours = diffMs / (1000 * 60 * 60);
        
        extraHours = Math.max(0, workHours - STANDARD_WORK_HOURS); // Floor at 0
        
        workHoursDisplay = workHours.toFixed(2);
        extraHoursDisplay = extraHours.toFixed(2);
        totalWorkingHours += workHours;
      } else {
        workHoursDisplay = 'In progress';
        extraHoursDisplay = '-';
      }
    }

    if (status === 'present' || status === 'half-day') {
      daysPresent++;
    } else if (status === 'leave') {
      leavesCount++;
    }

    monthDays.push({
      dateStr: dayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      checkIn: record && record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      checkOut: record && record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      status: status,
      workHoursDisplay,
      extraHoursDisplay
    });
  }

  return (
    <Box>
      {/* Sub-header row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Attendance</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCheckIn} 
            disabled={hasCheckedInToday}
          >
            Check In
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleCheckOut} 
            disabled={!hasCheckedInToday || hasCheckedOutToday}
          >
            Check Out
          </Button>
        </Box>
      </Box>

      {/* Controls row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePrevMonth}><ArrowBackIosIcon fontSize="small" /></IconButton>
          <Typography variant="h6" sx={{ mx: 2, minWidth: 100, textAlign: 'center' }}>
            {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Typography>
          <IconButton onClick={handleNextMonth}><ArrowForwardIosIcon fontSize="small" /></IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Paper sx={{ px: 2, py: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">Count of days present</Typography>
            <Typography variant="h6">{daysPresent}</Typography>
          </Paper>
          <Paper sx={{ px: 2, py: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">Leaves count</Typography>
            <Typography variant="h6">{leavesCount}</Typography>
          </Paper>
          <Paper sx={{ px: 2, py: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">Total working hours</Typography>
            <Typography variant="h6">{totalWorkingHours.toFixed(1)}h</Typography>
          </Paper>
        </Box>
      </Box>

      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
        Today: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
      </Typography>

      {/* Data Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell align="right">Work Hours</TableCell>
                <TableCell align="right">Extra hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthDays.map((day, idx) => (
                <TableRow key={idx}>
                  <TableCell>{day.dateStr}</TableCell>
                  <TableCell>
                    {day.status ? (
                      <Chip 
                        label={day.status} 
                        size="small" 
                        color={
                          day.status === 'present' ? 'success' : 
                          day.status === 'absent' ? 'error' : 
                          day.status === 'leave' ? 'warning' : 'default'
                        } 
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>{day.status === 'absent' || day.status === 'leave' ? '-' : day.checkIn}</TableCell>
                  <TableCell>{day.status === 'absent' || day.status === 'leave' ? '-' : day.checkOut}</TableCell>
                  <TableCell align="right">{day.workHoursDisplay}</TableCell>
                  <TableCell align="right">{day.extraHoursDisplay}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Attendance;
