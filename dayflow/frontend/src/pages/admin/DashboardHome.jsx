import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getEmployees, getAttendance, getLeaves } from '../../api/admin';

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, attRes, leaveRes] = await Promise.all([
          getEmployees(),
          getAttendance({ date: new Date().toISOString().split('T')[0] }),
          getLeaves(),
        ]);
        
        const employees = empRes.data;
        const attendance = attRes.data;
        const leaves = leaveRes.data;

        const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'half-day').length;
        const pendingCount = leaves.filter(l => l.status === 'pending').length;

        setMetrics({
          totalEmployees: employees.length,
          presentToday: presentCount,
          pendingLeaves: pendingCount,
        });

        // Mock data for last 7 days attendance trend (since we only queried today in reality, 
        // we'll just populate a static chart for the hackathon MVP to show recharts integration)
        setAttendanceData([
          { name: 'Mon', present: 40, absent: 5 },
          { name: 'Tue', present: 38, absent: 7 },
          { name: 'Wed', present: 42, absent: 3 },
          { name: 'Thu', present: 45, absent: 0 },
          { name: 'Fri', present: 41, absent: 4 },
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  const pieData = [
    { name: 'Present', value: metrics.presentToday },
    { name: 'Absent/Leave', value: metrics.totalEmployees - metrics.presentToday },
  ];
  const COLORS = ['#4caf50', '#f44336'];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Overview</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Employees</Typography>
              <Typography variant="h5">{metrics.totalEmployees}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Present Today</Typography>
              <Typography variant="h5">{metrics.presentToday}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pending Leave Approvals</Typography>
              <Typography variant="h5" color="error">{metrics.pendingLeaves}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Attendance Trend (This Week)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#4caf50" />
                <Bar dataKey="absent" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Today's Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
