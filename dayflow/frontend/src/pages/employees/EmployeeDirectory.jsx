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
      case 'on-leave': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'PRESENT';
      case 'on-leave': return 'ON LEAVE ✈️';
      case 'absent': return 'ABSENT';
      default: return 'UNKNOWN';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>DIRECTORY</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19' }}>
            Find and connect with your colleagues.
          </Typography>
        </Box>
        <TextField 
          placeholder="SEARCH EMPLOYEES..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', md: 350 } }}
          InputProps={{
            sx: { fontWeight: 700, fontFamily: 'Cabinet Grotesk, system-ui, sans-serif' }
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filtered.map(emp => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={emp.employeeId}>
            <Card sx={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea 
                onClick={() => navigate(`/employee/profile/${emp.employeeId}`)}
                sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1 }}
              >
                <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                  <Chip 
                    label={getStatusLabel(emp.status)} 
                    color={getStatusColor(emp.status)}
                    size="small"
                  />
                </Box>
                <Avatar sx={{ width: 80, height: 80, mb: 3, border: '2px solid #000', bgcolor: '#FFE17C', color: '#000', fontWeight: 800, fontSize: '1.5rem' }}>
                  {emp.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h4" sx={{ fontSize: '1.25rem', mb: 0.5, lineHeight: 1.2 }}>{emp.name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#171E19', mb: 2 }}>{emp.employeeId}</Typography>
                
                <Box sx={{ mt: 'auto', width: '100%', pt: 2, borderTop: '2px solid #000' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#171E19' }}>
                    View Profile &rarr;
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {filtered.length === 0 && (
        <Box sx={{ mt: 8, p: 6, bgcolor: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '8px 8px 0 #000', textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2 }}>NO EMPLOYEES FOUND</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Try adjusting your search criteria.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeDirectory;
