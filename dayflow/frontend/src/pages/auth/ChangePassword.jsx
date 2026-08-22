import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    setLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      
      if (res.user.role === 'admin') navigate('/admin');
      else navigate('/employee');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      py: 4,
      px: 2
    }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '4rem' } }}>
          DAYFLOW
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, color: 'text.secondary', letterSpacing: '-0.02em', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
          YOUR WORKDAY, SIMPLIFIED.
        </Typography>
      </Box>

      <Paper sx={{ 
        p: { xs: 3, md: 5 }, 
        width: '100%', 
        maxWidth: 450,
        bgcolor: '#fff',
        boxShadow: '8px 8px 0 #000'
      }}>
        <Typography variant="h3" sx={{ mb: 1, fontSize: '1.75rem' }}>
          UPDATE PASSWORD
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
          {user?.mustChangePassword 
            ? 'For security reasons, you must change your temporary password before accessing your dashboard.'
            : 'Change your account password below.'}
        </Typography>

        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#171E19', color: '#fff', border: '2px solid #000', borderRadius: '8px' }}>
            <Typography variant="body2" fontWeight="bold">{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Current Password</Typography>
            <TextField type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required fullWidth />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>New Password</Typography>
            <TextField type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required fullWidth />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Confirm New Password</Typography>
            <TextField type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required fullWidth />
          </Box>

          <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
