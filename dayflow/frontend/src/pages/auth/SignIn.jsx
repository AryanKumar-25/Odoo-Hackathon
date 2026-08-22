import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SignIn = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await login(loginId, password);
      
      if (user.mustChangePassword) {
        navigate('/auth/change-password');
      } else {
        if (user.role === 'admin') navigate('/admin');
        else navigate('/employee');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
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
        boxShadow: '8px 8px 0 #000' // Hard shadow for hero component
      }}>
        <Typography variant="h3" sx={{ mb: 3, fontSize: '1.75rem' }}>
          SIGN IN
        </Typography>

        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#171E19', color: '#fff', border: '2px solid #000', borderRadius: '8px' }}>
            <Typography variant="body2" fontWeight="bold">{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>
              Login ID / Email
            </Typography>
            <TextField 
              value={loginId} 
              onChange={(e) => setLoginId(e.target.value)} 
              required 
              fullWidth 
              placeholder="e.g. DF-1024"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>
              Password
            </Typography>
            <TextField 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              fullWidth 
              placeholder="Enter your password"
            />
          </Box>

          <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #000', textAlign: 'center' }}>
          <Typography variant="body1" fontWeight="bold">
            Company not registered yet?{' '}
            <MuiLink component={Link} to="/auth/signup" sx={{ color: '#000', textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '4px' }}>
              Register Company
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignIn;
