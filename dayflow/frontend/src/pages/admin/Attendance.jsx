import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TextField, MenuItem, Button
} from '@mui/material';
import { getAttendance } from '../../api/admin';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    employeeId: '',
    status: ''
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Clean empty filters
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.status) params.status = filters.status;

      const res = await getAttendance(params);
      setRecords(res.data);
    } catch (error) {
      console.error('Error fetching attendance', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []); // Initial load

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchAttendance();
  };

  const handleClear = () => {
    setFilters({ date: '', employeeId: '', status: '' });
    // Note: React state update is async, so we pass empty object to fetch
    getAttendance({}).then(res => setRecords(res.data)).catch(console.error);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Attendance Oversight</Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          type="date"
          name="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
          value={filters.date}
          onChange={handleFilterChange}
          size="small"
        />
        <TextField
          name="employeeId"
          label="Employee ID"
          value={filters.employeeId}
          onChange={handleFilterChange}
          size="small"
        />
        <TextField
          select
          name="status"
          label="Status"
          value={filters.status}
          onChange={handleFilterChange}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="present">Present</MenuItem>
          <MenuItem value="absent">Absent</MenuItem>
          <MenuItem value="half-day">Half-Day</MenuItem>
          <MenuItem value="leave">Leave</MenuItem>
        </TextField>
        <Button variant="contained" onClick={handleSearch}>Search</Button>
        <Button variant="outlined" onClick={handleClear}>Clear</Button>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length > 0 ? (
                records.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
                    <TableCell>{rec.employeeId}</TableCell>
                    <TableCell>{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '-'}</TableCell>
                    <TableCell>{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '-'}</TableCell>
                    <TableCell>{rec.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No attendance records found</TableCell>
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
