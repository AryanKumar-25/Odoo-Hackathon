import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, TextField, IconButton, Chip 
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import { getAttendance } from '../../api/admin';

const STANDARD_WORK_HOURS = 8; 

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>ATTENDANCE</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19' }}>
            Monitor daily employee check-ins and hours.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', border: '2px solid #000', borderRadius: '8px', px: 2, py: 0.5, boxShadow: '4px 4px 0 #000', width: { xs: '100%', md: 'auto' } }}>
          <SearchIcon sx={{ color: '#000', mr: 1 }} />
          <TextField 
            variant="standard"
            placeholder="SEARCH BY NAME OR ID"
            InputProps={{ disableUnderline: true, sx: { fontWeight: 700, fontFamily: 'Cabinet Grotesk, system-ui, sans-serif' } }}
            sx={{ width: { xs: '100%', md: 250 } }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, p: 2, bgcolor: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0 #000' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePrevDay} sx={{ border: '2px solid #000', borderRadius: '4px', p: 1, '&:hover': { bgcolor: '#f0f0f0' } }}>
            <ArrowBackIosIcon fontSize="small" sx={{ ml: 0.5, color: '#000' }} />
          </IconButton>
          <Typography variant="h4" sx={{ mx: 3, minWidth: 200, textAlign: 'center', fontSize: '1.5rem', textTransform: 'uppercase' }}>
            {currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </Typography>
          <IconButton onClick={handleNextDay} disabled={isNextDayDisabled()} sx={{ border: '2px solid #000', borderRadius: '4px', p: 1, '&:disabled': { opacity: 0.5 }, '&:hover': { bgcolor: '#f0f0f0' } }}>
            <ArrowForwardIosIcon fontSize="small" sx={{ color: '#000' }} />
          </IconButton>
        </Box>
        <Chip label="DAY VIEW" sx={{ bgcolor: '#FFE17C', color: '#000', border: '2px solid #000', fontWeight: 800, display: { xs: 'none', sm: 'flex' } }} />
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
                <TableCell>EMP ID</TableCell>
                <TableCell>NAME</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>CHECK IN</TableCell>
                <TableCell>CHECK OUT</TableCell>
                <TableCell align="right">WORK HOURS</TableCell>
                <TableCell align="right">EXTRA HOURS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  
                  let displayStatus = rec.status;
                  
                  if (!displayStatus) {
                    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
                    
                    if (isWeekend) {
                      displayStatus = 'no_record';
                    } else if (currentDate <= today) {
                      displayStatus = 'absent';
                    } else {
                      displayStatus = 'no_record'; 
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
                      workHoursDisplay = 'IN PROGRESS';
                    }
                  }

                  return (
                    <TableRow key={rec.employeeId} hover>
                      <TableCell sx={{ fontWeight: 800 }}>{rec.employeeId}</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>{rec.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={displayStatus === 'no_record' ? 'NO RECORD' : displayStatus.toUpperCase()} 
                          size="small" 
                          sx={{
                            fontWeight: 800,
                            border: '2px solid #000',
                            bgcolor: displayStatus === 'present' ? '#B7C6C2' : 
                                     displayStatus === 'absent' ? '#171E19' : 
                                     displayStatus === 'leave' ? '#FFE17C' : '#fff',
                            color: displayStatus === 'absent' ? '#fff' : '#000'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{(displayStatus === 'absent' || displayStatus === 'leave' || displayStatus === 'no_record' || !rec.checkIn) ? '-' : new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{(displayStatus === 'absent' || displayStatus === 'leave' || displayStatus === 'no_record' || !rec.checkOut) ? '-' : new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>{workHoursDisplay}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>{extraHoursDisplay}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="h3" sx={{ mb: 2 }}>NO ATTENDANCE RECORDS</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
