import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, IconButton, Paper, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Chip 
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getMyAttendance, checkIn, checkOut } from '../../api/employee';

const STANDARD_WORK_HOURS = 8;

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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
      fetchAttendance(); 
    } catch (error) {
      alert(error.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      fetchAttendance(); 
    } catch (error) {
      alert(error.response?.data?.error || 'Check-out failed');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date.startsWith(todayStr));
  const hasCheckedInToday = !!(todayRecord && todayRecord.checkIn);
  const hasCheckedOutToday = !!(todayRecord && todayRecord.checkOut);

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
        
        extraHours = Math.max(0, workHours - STANDARD_WORK_HOURS); 
        
        workHoursDisplay = workHours.toFixed(2);
        extraHoursDisplay = extraHours.toFixed(2);
        totalWorkingHours += workHours;
      } else {
        workHoursDisplay = 'IN PROGRESS';
        extraHoursDisplay = '-';
      }
    }

    if (status === 'present' || status === 'half-day') {
      daysPresent++;
    } else if (status === 'leave') {
      leavesCount++;
    }

    monthDays.push({
      dateStr: dayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
      checkIn: record && record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      checkOut: record && record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      status: status,
      workHoursDisplay,
      extraHoursDisplay
    });
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>ATTENDANCE</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19' }}>
            Track your hours and daily check-ins.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <Button 
            variant="contained" 
            onClick={handleCheckIn} 
            disabled={hasCheckedInToday}
            sx={{ flex: { xs: 1, md: 'none' }, bgcolor: '#FFE17C', color: '#000', py: 1.5, px: 3, fontSize: '1.1rem', '&:hover': { bgcolor: '#e5ca6f' } }}
          >
            CHECK IN
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCheckOut} 
            disabled={!hasCheckedInToday || hasCheckedOutToday}
            sx={{ flex: { xs: 1, md: 'none' }, bgcolor: '#171E19', color: '#fff', py: 1.5, px: 3, fontSize: '1.1rem', '&:hover': { bgcolor: '#000' } }}
          >
            CHECK OUT
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2, p: 2, bgcolor: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0 #000' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePrevMonth} sx={{ border: '2px solid #000', borderRadius: '4px', p: 1, '&:hover': { bgcolor: '#f0f0f0' } }}>
            <ArrowBackIosIcon fontSize="small" sx={{ ml: 0.5, color: '#000' }} />
          </IconButton>
          <Typography variant="h4" sx={{ mx: 3, minWidth: 150, textAlign: 'center', fontSize: '1.5rem', textTransform: 'uppercase' }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </Typography>
          <IconButton onClick={handleNextMonth} sx={{ border: '2px solid #000', borderRadius: '4px', p: 1, '&:hover': { bgcolor: '#f0f0f0' } }}>
            <ArrowForwardIosIcon fontSize="small" sx={{ color: '#000' }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ px: 2, py: 1, textAlign: 'center', bgcolor: '#FFE17C', border: '2px solid #000', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>DAYS PRESENT</Typography>
            <Typography variant="h4">{daysPresent}</Typography>
          </Box>
          <Box sx={{ px: 2, py: 1, textAlign: 'center', bgcolor: '#B7C6C2', border: '2px solid #000', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>LEAVES TAKEN</Typography>
            <Typography variant="h4">{leavesCount}</Typography>
          </Box>
          <Box sx={{ px: 2, py: 1, textAlign: 'center', bgcolor: '#eee', border: '2px solid #000', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>TOTAL HOURS</Typography>
            <Typography variant="h4">{totalWorkingHours.toFixed(1)}h</Typography>
          </Box>
        </Box>
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
                <TableCell>DATE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>CHECK IN</TableCell>
                <TableCell>CHECK OUT</TableCell>
                <TableCell align="right">WORK HOURS</TableCell>
                <TableCell align="right">EXTRA HOURS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthDays.map((day, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{day.dateStr}</TableCell>
                  <TableCell>
                    {day.status ? (
                      <Chip 
                        label={day.status.toUpperCase()} 
                        size="small" 
                        sx={{
                          fontWeight: 800,
                          border: '2px solid #000',
                          bgcolor: day.status === 'present' ? '#B7C6C2' : 
                                   day.status === 'absent' ? '#171E19' : 
                                   day.status === 'leave' ? '#FFE17C' : '#fff',
                          color: day.status === 'absent' ? '#fff' : '#000'
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#666' }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{day.status === 'absent' || day.status === 'leave' ? '-' : day.checkIn}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{day.status === 'absent' || day.status === 'leave' ? '-' : day.checkOut}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>{day.workHoursDisplay}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>{day.extraHoursDisplay}</TableCell>
                </TableRow>
              ))}
              {monthDays.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h3" sx={{ mb: 2 }}>NO ATTENDANCE RECORDS</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      No records found for this month yet.
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
