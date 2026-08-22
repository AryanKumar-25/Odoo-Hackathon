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
      
      // Navigate to respective dashboard
      if (res.user.role === 'admin') navigate('/admin');
      else navigate('/employee');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          Update Password
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          {user?.mustChangePassword 
            ? 'For security reasons, you must change your temporary password before accessing your dashboard.'
            : 'Change your account password below.'}
        </Typography>

        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Current Password" 
            type="password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            required 
            fullWidth 
          />
          <TextField 
            label="New Password" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            fullWidth 
          />
          <TextField 
            label="Confirm New Password" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            fullWidth 
          />

          <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 1 }} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
