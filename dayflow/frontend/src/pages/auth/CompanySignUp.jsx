import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CompanySignUp = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    logoUrl: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await signup(formData);
      navigate('/admin'); // Assuming admin routes map to /admin
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          Register Company
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Create an Admin account and set up your Dayflow workspace. Employees cannot self-register.
        </Typography>

        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required fullWidth />
          <TextField label="Company Logo URL (Optional)" name="logoUrl" value={formData.logoUrl} onChange={handleChange} fullWidth helperText="Leave blank for hackathon" />
          <TextField label="Your Name (Admin)" name="name" value={formData.name} onChange={handleChange} required fullWidth />
          <TextField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required fullWidth />
          <TextField label="Phone (Optional)" name="phone" value={formData.phone} onChange={handleChange} fullWidth />
          <TextField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required fullWidth />
          <TextField label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required fullWidth />

          <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 1 }}>
            Register & Continue
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Already registered?{' '}
          <MuiLink component={Link} to="/auth/login">
            Sign In here
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default CompanySignUp;
