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
      
      // If forced to change password
      if (user.mustChangePassword) {
        navigate('/auth/change-password');
      } else {
        // Redirect based on role
        if (user.role === 'admin') navigate('/admin');
        else navigate('/employee');
      }
    } catch (err) {
      // Use generic error for security
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          Sign In
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Log in with your Email or Employee ID.
        </Typography>

        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Login ID / Email" 
            value={loginId} 
            onChange={(e) => setLoginId(e.target.value)} 
            required 
            fullWidth 
          />
          <TextField 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            fullWidth 
          />

          <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 1 }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Company not registered yet?{' '}
          <MuiLink component={Link} to="/auth/signup">
            Register Company
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignIn;
