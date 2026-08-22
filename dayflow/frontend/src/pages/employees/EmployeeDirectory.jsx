import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Avatar, TextField, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getEmployeeDirectory } from '../../api/employees';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDir = async () => {
      try {
        const res = await getEmployeeDirectory();
        setEmployees(res.data);
      } catch (err) {
        console.error('Failed to load directory', err);
      }
    };
    fetchDir();
  }, []);

  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'on-leave': return 'info';
      case 'absent': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'on-leave': return 'On Leave ✈️';
      case 'absent': return 'Absent';
      default: return 'Unknown';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Employee Directory</Typography>
        <TextField 
          placeholder="Search employees..." 
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filtered.map(emp => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={emp.employeeId}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardActionArea 
                onClick={() => navigate(`/employee/profile/${emp.employeeId}`)}
                sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  <Chip 
                    label={getStatusLabel(emp.status)} 
                    color={getStatusColor(emp.status)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Avatar sx={{ width: 64, height: 64, mb: 2 }} />
                <Typography variant="h6" fontWeight="bold">{emp.name}</Typography>
                <Typography variant="body2" color="textSecondary">{emp.employeeId}</Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {filtered.length === 0 && (
        <Typography color="textSecondary" align="center" sx={{ mt: 4 }}>
          No employees found.
        </Typography>
      )}
    </Box>
  );
};

export default EmployeeDirectory;
