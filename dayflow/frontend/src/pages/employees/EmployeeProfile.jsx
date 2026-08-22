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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isSelf = user.employeeId === employeeId;
  const isAdmin = user.role === 'admin';
  const isColleague = !isSelf && !isAdmin;

  const fetchProfile = async (currentTab) => {
    try {
      setLoading(true);
      if (currentTab === 'security') {
        setProfileData({}); 
        setLoading(false);
        return;
      }
      
      const res = await getEmployeeProfile(employeeId, currentTab);
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: '1.75rem' }}>RESUME</Typography>
          <Box>
            {canEditResume && !isEditing && (
              <Button onClick={handleEditClick} variant="contained" sx={{ bgcolor: '#FFE17C', color: '#000' }}>EDIT PROFILE</Button>
            )}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => setIsEditing(false)} variant="outlined">CANCEL</Button>
                <Button onClick={handleSaveClick} variant="contained" sx={{ bgcolor: '#000', color: '#fff' }}>SAVE CHANGES</Button>
              </Box>
            )}
          </Box>
        </Box>
        
        {isEditing ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>About Me</Typography>
              <TextField 
                fullWidth multiline rows={4} 
                value={editData.about || ''} 
                onChange={e => setEditData({...editData, about: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Hobbies</Typography>
              <TextField 
                fullWidth multiline rows={2} 
                value={editData.hobbies || ''} 
                onChange={e => setEditData({...editData, hobbies: e.target.value})}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ p: 3, border: '2px solid #000', borderRadius: '12px', bgcolor: '#fff', height: '100%', boxShadow: '4px 4px 0 #000' }}>
                <Typography variant="h4" sx={{ mb: 2, fontSize: '1.25rem' }}>ABOUT ME</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>{resume.about || 'No information provided.'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                <Box sx={{ p: 3, border: '2px solid #000', borderRadius: '12px', bgcolor: '#FFE17C', flex: 1, boxShadow: '4px 4px 0 #000' }}>
                  <Typography variant="h4" sx={{ mb: 2, fontSize: '1.25rem' }}>HOBBIES</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{resume.hobbies || '-'}</Typography>
                </Box>
                <Box sx={{ p: 3, border: '2px solid #000', borderRadius: '12px', bgcolor: '#B7C6C2', flex: 1, boxShadow: '4px 4px 0 #000' }}>
                  <Typography variant="h4" sx={{ mb: 2, fontSize: '1.25rem' }}>SKILLS</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Array.isArray(resume.skills) && resume.skills.length > 0 
                      ? resume.skills.map(s => <Chip key={s} label={s} sx={{ bgcolor: '#fff', border: '2px solid #000', fontWeight: 800 }} />)
                      : <Typography variant="body1" sx={{ fontWeight: 500 }}>-</Typography>}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    );
  };

  const renderPrivateInfo = () => {
    if (!profileData?.privateInfo) return null;
    const { privateInfo, header } = profileData;
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: '1.75rem' }}>PRIVATE INFO</Typography>
          <Box>
            {canEditPrivate && !isEditing && (
              <Button onClick={handleEditClick} variant="contained" sx={{ bgcolor: '#FFE17C', color: '#000' }}>EDIT DETAILS</Button>
            )}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => setIsEditing(false)} variant="outlined">CANCEL</Button>
                <Button onClick={handleSaveClick} variant="contained" sx={{ bgcolor: '#000', color: '#fff' }}>SAVE CHANGES</Button>
              </Box>
            )}
          </Box>
        </Box>
        
        <Box sx={{ p: 3, border: '2px solid #000', borderRadius: '12px', bgcolor: '#fff', boxShadow: '4px 4px 0 #000' }}>
          <Grid container spacing={4}>
            {isEditing ? (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Phone</Typography>
                  <TextField 
                    fullWidth 
                    value={editData.phone || ''} 
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Address</Typography>
                  <TextField 
                    fullWidth 
                    value={editData.address || ''} 
                    onChange={e => setEditData({...editData, address: e.target.value})}
                  />
                </Grid>
                {isAdmin && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Date of Birth</Typography>
                      <TextField 
                        fullWidth type="date" 
                        value={editData.dob ? editData.dob.split('T')[0] : ''} 
                        onChange={e => setEditData({...editData, dob: new Date(e.target.value).toISOString()})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Date of Joining</Typography>
                      <TextField 
                        fullWidth type="date" 
                        value={editData.doj ? editData.doj.split('T')[0] : ''} 
                        onChange={e => setEditData({...editData, doj: new Date(e.target.value).toISOString()})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Gender</Typography>
                      <TextField 
                        fullWidth 
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#171E19', mb: 0.5 }}>PHONE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{header.phone || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#171E19', mb: 0.5 }}>ADDRESS</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{privateInfo.address || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#171E19', mb: 0.5 }}>DATE OF BIRTH</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{privateInfo.dob ? new Date(privateInfo.dob).toLocaleDateString() : '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#171E19', mb: 0.5 }}>DATE OF JOINING</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{privateInfo.doj ? new Date(privateInfo.doj).toLocaleDateString() : '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#171E19', mb: 0.5 }}>GENDER</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{privateInfo.gender || '-'}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Box>
    );
  };

  const renderSalaryInfo = () => {
    if (isColleague) {
      return (
        <Box sx={{ p: 4, bgcolor: '#171E19', color: '#fff', border: '2px solid #000', borderRadius: '12px', textAlign: 'center', boxShadow: '4px 4px 0 #000' }}>
          <Typography variant="h4" sx={{ mb: 1 }}>RESTRICTED ACCESS</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>You do not have permission to view salary information.</Typography>
        </Box>
      );
    }
    
    if (!profileData?.salary) return null;
    const { salary } = profileData;
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: '1.75rem' }}>COMPENSATION</Typography>
          <Box>
            {canEditSalary && !isEditing && (
              <Button onClick={handleEditClick} variant="contained" sx={{ bgcolor: '#FFE17C', color: '#000' }}>EDIT SALARY</Button>
            )}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => setIsEditing(false)} variant="outlined">CANCEL</Button>
                <Button onClick={handleSaveClick} variant="contained" sx={{ bgcolor: '#000', color: '#fff' }}>SAVE CHANGES</Button>
              </Box>
            )}
          </Box>
        </Box>
        
        {isEditing ? (
          <Box sx={{ p: 3, border: '2px solid #000', borderRadius: '12px', bgcolor: '#fff', boxShadow: '4px 4px 0 #000' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Total Wage (Monthly)</Typography>
                <TextField 
                  fullWidth type="number"
                  value={editData.wage || 0} 
                  onChange={e => setEditData({...editData, wage: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 1 }}>SALARY STRUCTURE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                  Apply the default 50/50 rule for Basic and HRA components based on the new total wage.
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setEditData({
                    ...editData, 
                    components: [
                      { name: 'Basic', type: 'percentage_of_wage', value: 50 },
                      { name: 'HRA', type: 'percentage_of_basic', value: 50 }
                    ]
                  })}
                  sx={{ bgcolor: '#FFE17C', color: '#000', border: '2px solid #000' }}
                >
                  APPLY DEFAULT 50/50 STRUCTURE
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 4, border: '2px solid #000', borderRadius: '12px', bgcolor: '#171E19', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '4px 4px 0 #000' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 1, opacity: 0.8 }}>TOTAL WAGE (MONTHLY)</Typography>
                <Typography variant="h2" sx={{ fontSize: '3rem', color: '#FFE17C' }}>₹{salary.wage?.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ p: 3, border: '2px solid #000', borderRadius: '12px', bgcolor: '#fff', height: '100%', boxShadow: '4px 4px 0 #000' }}>
                <Typography variant="h4" sx={{ mb: 3, fontSize: '1.25rem' }}>SALARY BREAKDOWN</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {salary.components && Array.isArray(salary.components) && salary.components.map((c, i) => {
                    let calcVal = 0;
                    let basicVal = salary.wage * 0.5; 
                    if (c.type === 'percentage_of_wage') calcVal = (salary.wage * c.value) / 100;
                    if (c.type === 'percentage_of_basic') calcVal = (basicVal * c.value) / 100;
                    
                    return (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f5f5f5', border: '2px solid #000', borderRadius: '8px' }}>
                        <Typography variant="body1" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>{c.name}</Typography>
                        <Typography variant="h5">₹{calcVal.toLocaleString()}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    );
  };

  const renderSecurity = () => {
    if (!isSelf) {
      return (
        <Box sx={{ p: 4, bgcolor: '#171E19', color: '#fff', border: '2px solid #000', borderRadius: '12px', textAlign: 'center', boxShadow: '4px 4px 0 #000' }}>
          <Typography variant="h4" sx={{ mb: 1 }}>RESTRICTED ACCESS</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>You can only view your own security settings.</Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: '1.75rem' }}>SECURITY & ACCESS</Typography>
        </Box>
        <Box sx={{ p: 4, border: '2px solid #000', borderRadius: '12px', bgcolor: '#fff', boxShadow: '4px 4px 0 #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1, fontSize: '1.25rem' }}>ACCOUNT PASSWORD</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#171E19' }}>Update your password regularly to keep your account secure.</Typography>
          </Box>
          <Button variant="contained" sx={{ bgcolor: '#000', color: '#fff', px: 4, py: 1.5 }}>
            UPDATE PASSWORD
          </Button>
        </Box>
      </Box>
    );
  };

  if (loading && !profileData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#000' }} /></Box>;
  }

  const header = profileData?.header;

  return (
    <Box>
      {/* Header */}
      {header && (
        <Box sx={{ p: { xs: 3, md: 5 }, mb: 5, border: '2px solid #000', borderRadius: '16px', bgcolor: '#fff', boxShadow: '8px 8px 0 #000', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
          <Avatar sx={{ width: 120, height: 120, border: '4px solid #000', bgcolor: '#FFE17C', color: '#000', fontSize: '3rem', fontWeight: 800 }}>
            {header.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h1" sx={{ fontSize: '2.5rem', mb: 1 }}>{header.name}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#171E19', mb: 2 }}>
              {header.company ? `${header.company} • ` : ''}{header.department || 'No Department'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Chip label={header.employeeId} sx={{ bgcolor: '#000', color: '#fff', fontWeight: 800, border: '2px solid #000' }} />
              <Chip label={header.email} sx={{ bgcolor: '#fff', color: '#000', fontWeight: 800, border: '2px solid #000' }} />
              {header.manager && <Chip label={`MGR: ${header.manager}`} sx={{ bgcolor: '#B7C6C2', color: '#000', fontWeight: 800, border: '2px solid #000' }} />}
            </Box>
          </Box>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: '2px solid #000', mb: 4 }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)}
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{
            '& .MuiTab-root': {
              border: '2px solid transparent',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              mr: 1,
              px: 3,
              opacity: 1,
            },
            '& .Mui-selected': {
              bgcolor: '#fff',
              border: '2px solid #000',
              borderBottom: '2px solid #fff',
              mb: '-2px',
              color: '#000 !important',
              zIndex: 1
            }
          }}
        >
          <Tab label="RESUME" value="resume" />
          <Tab label="PRIVATE INFO" value="private" />
          {!isColleague && <Tab label="SALARY INFO" value="salary" />}
          {isSelf && <Tab label="SECURITY" value="security" />}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ minHeight: '400px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#000' }} /></Box>
        ) : (
          <>
            {tab === 'resume' && renderResume()}
            {tab === 'private' && renderPrivateInfo()}
            {tab === 'salary' && renderSalaryInfo()}
            {tab === 'security' && renderSecurity()}
          </>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeProfile;
