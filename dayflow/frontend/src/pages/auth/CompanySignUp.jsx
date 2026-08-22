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
      navigate('/admin'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed');
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
        maxWidth: 500,
        bgcolor: '#fff',
        boxShadow: '8px 8px 0 #000'
      }}>
        <Typography variant="h3" sx={{ mb: 1, fontSize: '1.75rem' }}>
          REGISTER COMPANY
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
          Create an Admin account. Employees cannot self-register.
        </Typography>

        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#171E19', color: '#fff', border: '2px solid #000', borderRadius: '8px' }}>
            <Typography variant="body2" fontWeight="bold">{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Company Name</Typography>
            <TextField name="companyName" value={formData.companyName} onChange={handleChange} required fullWidth />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Admin Name</Typography>
            <TextField name="name" value={formData.name} onChange={handleChange} required fullWidth />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Admin Email</Typography>
            <TextField type="email" name="email" value={formData.email} onChange={handleChange} required fullWidth />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Phone (Optional)</Typography>
            <TextField name="phone" value={formData.phone} onChange={handleChange} fullWidth />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Password</Typography>
              <TextField type="password" name="password" value={formData.password} onChange={handleChange} required fullWidth />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Confirm Password</Typography>
              <TextField type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required fullWidth />
            </Box>
          </Box>

          <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }}>
            REGISTER & CONTINUE
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #000', textAlign: 'center' }}>
          <Typography variant="body1" fontWeight="bold">
            Already registered?{' '}
            <MuiLink component={Link} to="/auth/login" sx={{ color: '#000', textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '4px' }}>
              Sign In here
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CompanySignUp;
