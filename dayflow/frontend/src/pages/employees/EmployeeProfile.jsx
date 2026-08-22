import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Tabs, Tab, CircularProgress, 
  Paper, Grid, Button, TextField, Chip, Divider, Avatar
} from '@mui/material';
import { getEmployeeProfile, updateEmployeeProfile, updateEmployeeSalary } from '../../api/employees';
import { useAuth } from '../../context/AuthContext';

const EmployeeProfile = () => {
  const { employeeId: paramEmployeeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const employeeId = paramEmployeeId || user.employeeId;

  const [tab, setTab] = useState('resume');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  // Edit modes
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isSelf = user.employeeId === employeeId;
  const isAdmin = user.role === 'admin';
  const isColleague = !isSelf && !isAdmin;

  const fetchProfile = async (currentTab) => {
    try {
      setLoading(true);
      if (currentTab === 'security') {
        setProfileData({}); // Security tab has no remote data yet
        setLoading(false);
        return;
      }
      
      const res = await getEmployeeProfile(employeeId, currentTab);
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        // Forbidden, usually if a colleague tries to access salary
        setProfileData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(tab);
    setIsEditing(false);
  }, [tab, employeeId]);

  const handleEditClick = () => {
    let initialData = {};
    if (tab === 'resume') initialData = profileData.resume;
    if (tab === 'private') initialData = { ...profileData.privateInfo, phone: profileData.header.phone };
    if (tab === 'salary') initialData = profileData.salary;
    
    setEditData(initialData || {});
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      if (tab === 'salary') {
        await updateEmployeeSalary(employeeId, editData);
      } else {
        await updateEmployeeProfile(employeeId, editData);
      }
      setIsEditing(false);
      fetchProfile(tab);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save');
    }
  };

  const canEditResume = isAdmin || isSelf;
  const canEditPrivate = isAdmin || isSelf;
  const canEditSalary = isAdmin;

  const renderResume = () => {
    if (!profileData?.resume) return null;
    const { resume } = profileData;
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Resume</Typography>
          {canEditResume && !isEditing && <Button onClick={handleEditClick} variant="outlined">Edit</Button>}
          {isEditing && (
            <Box>
              <Button onClick={() => setIsEditing(false)} sx={{ mr: 1 }}>Cancel</Button>
              <Button onClick={handleSaveClick} variant="contained">Save</Button>
            </Box>
          )}
        </Box>
        
        {isEditing ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth multiline rows={4} label="About" 
                value={editData.about || ''} 
                onChange={e => setEditData({...editData, about: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth multiline rows={2} label="Hobbies" 
                value={editData.hobbies || ''} 
                onChange={e => setEditData({...editData, hobbies: e.target.value})}
              />
            </Grid>
            {/* Skills and Certs would be complex inputs in reality, just simple text for now */}
          </Grid>
        ) : (
          <Box>
            <Typography variant="subtitle2" color="textSecondary">About</Typography>
            <Typography paragraph>{resume.about || 'No information provided.'}</Typography>
            
            <Typography variant="subtitle2" color="textSecondary">Hobbies</Typography>
            <Typography paragraph>{resume.hobbies || '-'}</Typography>
            
            <Typography variant="subtitle2" color="textSecondary">Skills</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {Array.isArray(resume.skills) && resume.skills.length > 0 
                ? resume.skills.map(s => <Chip key={s} label={s} />)
                : <Typography variant="body2">-</Typography>}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderPrivateInfo = () => {
    if (!profileData?.privateInfo) return null;
    const { privateInfo, header } = profileData;
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Private Information</Typography>
          {canEditPrivate && !isEditing && <Button onClick={handleEditClick} variant="outlined">Edit</Button>}
          {isEditing && (
            <Box>
              <Button onClick={() => setIsEditing(false)} sx={{ mr: 1 }}>Cancel</Button>
              <Button onClick={handleSaveClick} variant="contained">Save</Button>
            </Box>
          )}
        </Box>
        
        <Grid container spacing={3}>
          {isEditing ? (
            <>
              {/* Only Admin can edit DOB, Self cannot */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth label="Phone" 
                  value={editData.phone || ''} 
                  onChange={e => setEditData({...editData, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth label="Address" 
                  value={editData.address || ''} 
                  onChange={e => setEditData({...editData, address: e.target.value})}
                />
              </Grid>
              {isAdmin && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }}
                      value={editData.dob ? editData.dob.split('T')[0] : ''} 
                      onChange={e => setEditData({...editData, dob: new Date(e.target.value).toISOString()})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="Date of Joining" type="date" InputLabelProps={{ shrink: true }}
                      value={editData.doj ? editData.doj.split('T')[0] : ''} 
                      onChange={e => setEditData({...editData, doj: new Date(e.target.value).toISOString()})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="Gender" 
                      value={editData.gender || ''} 
                      onChange={e => setEditData({...editData, gender: e.target.value})}
                    />
                  </Grid>
                </>
              )}
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                <Typography>{header.phone || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                <Typography>{privateInfo.address || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                <Typography>{privateInfo.dob ? new Date(privateInfo.dob).toLocaleDateString() : '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Date of Joining</Typography>
                <Typography>{privateInfo.doj ? new Date(privateInfo.doj).toLocaleDateString() : '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                <Typography>{privateInfo.gender || '-'}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    );
  };

  const renderSalaryInfo = () => {
    if (isColleague) {
      return <Typography color="error">You do not have permission to view this tab.</Typography>;
    }
    
    if (!profileData?.salary) return null;
    const { salary } = profileData;
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Salary Information</Typography>
          {canEditSalary && !isEditing && <Button onClick={handleEditClick} variant="outlined">Edit</Button>}
          {isEditing && (
            <Box>
              <Button onClick={() => setIsEditing(false)} sx={{ mr: 1 }}>Cancel</Button>
              <Button onClick={handleSaveClick} variant="contained">Save</Button>
            </Box>
          )}
        </Box>
        
        {isEditing ? (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Total Wage" type="number"
                value={editData.wage || 0} 
                onChange={e => setEditData({...editData, wage: Number(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Salary Components (Mock Basic setup)</Typography>
              {/* Complex component calculation UI goes here in a full app. For the hackathon, we can hardcode Basic at 50% */}
              <Typography variant="body2" color="textSecondary">
                In this demo, saving will set Basic to 50% of wage and HRA to 50% of Basic.
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 1 }}
                onClick={() => setEditData({
                  ...editData, 
                  components: [
                    { name: 'Basic', type: 'percentage_of_wage', value: 50 },
                    { name: 'HRA', type: 'percentage_of_basic', value: 50 }
                  ]
                })}
              >
                Apply Default 50/50 Structure
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="textSecondary">Total Wage</Typography>
                  <Typography variant="h5">₹{salary.wage?.toLocaleString()}</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Salary Breakdown</Typography>
              {salary.components && Array.isArray(salary.components) && salary.components.map((c, i) => {
                let calcVal = 0;
                let basicVal = salary.wage * 0.5; // Mock basic lookup
                if (c.type === 'percentage_of_wage') calcVal = (salary.wage * c.value) / 100;
                if (c.type === 'percentage_of_basic') calcVal = (basicVal * c.value) / 100;
                
                return (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', py: 1 }}>
                    <Typography>{c.name}</Typography>
                    <Typography>₹{calcVal.toLocaleString()}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderSecurity = () => {
    if (!isSelf) {
      return <Typography color="error">You can only view your own security settings.</Typography>;
    }
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Security</Typography>
        <Typography variant="body2" color="textSecondary" mb={3}>
          Update your password and account security settings here.
        </Typography>
        <Button variant="outlined" color="primary">Change Password</Button>
      </Box>
    );
  };

  if (loading && !profileData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  const header = profileData?.header;

  return (
    <Box>
      {/* Header */}
      {header && (
        <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 100, height: 100 }} />
          <Box>
            <Typography variant="h4">{header.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {header.company ? `${header.company} • ` : ''}{header.department || 'No Department'} • {header.employeeId}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Chip label={header.email} size="small" variant="outlined" />
              {header.phone && <Chip label={header.phone} size="small" variant="outlined" />}
              {header.manager && <Chip label={`Manager: ${header.manager}`} size="small" variant="outlined" color="primary" />}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Resume" value="resume" />
          <Tab label="Private Info" value="private" />
          {!isColleague && <Tab label="Salary Info" value="salary" />}
          {isSelf && <Tab label="Security" value="security" />}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Paper sx={{ p: 3 }}>
        {loading ? <CircularProgress /> : (
          <>
            {tab === 'resume' && renderResume()}
            {tab === 'private' && renderPrivateInfo()}
            {tab === 'salary' && renderSalaryInfo()}
            {tab === 'security' && renderSecurity()}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeProfile;
