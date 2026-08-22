import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Tabs, Tab, CircularProgress, 
  Paper, Grid, Button, TextField, Chip, Divider, Avatar, MenuItem
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [liveError, setLiveError] = useState('');

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
    setLiveError('');
  };

  const handleSaveInit = () => {
    if (tab === 'salary') {
      let sum = 0;
      (editData.components || []).forEach(c => {
        if (c.type === 'percentage_of_wage') sum += Number(c.value);
      });
      if (sum > 100) {
        setLiveError('Percentage of wage cannot exceed 100%');
        return;
      }
      setConfirmOpen(true);
    } else {
      handleSaveClick();
    }
  };

  const handleSaveClick = async () => {
    try {
      if (tab === 'salary') {
        await updateEmployeeSalary(employeeId, editData);
      } else {
        await updateEmployeeProfile(employeeId, editData);
      }
      setIsEditing(false);
      setConfirmOpen(false);
      setLiveError('');
      fetchProfile(tab);
    } catch (err) {
      console.error(err);
      if (tab === 'salary') {
        setLiveError(err.response?.data?.error || 'Failed to save');
        setConfirmOpen(false);
      } else {
        alert(err.response?.data?.error || 'Failed to save');
      }
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
    
    let sumPercentage = 0;
    (editData.components || []).forEach(c => {
      if (c.type === 'percentage_of_wage') sumPercentage += Number(c.value);
    });
    
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
                <Button onClick={handleSaveInit} disabled={sumPercentage > 100} variant="contained" sx={{ bgcolor: '#000', color: '#fff', '&:disabled': { bgcolor: '#ccc' } }}>SAVE CHANGES</Button>
              </Box>
            )}
          </Box>
        </Box>
        
        {liveError && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#ffcdd2', border: '2px solid #b71c1c', borderRadius: '8px', color: '#b71c1c', fontWeight: 800 }}>
            {liveError}
          </Box>
        )}
        
        {isEditing ? (
          <Box sx={{ p: 3, border: '2px solid #000', borderRadius: '12px', bgcolor: '#fff', boxShadow: '4px 4px 0 #000' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Monthly Wage (₹)</Typography>
                <TextField 
                  fullWidth type="number"
                  value={editData.wage || 0} 
                  onChange={e => setEditData({...editData, wage: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Working Days/Week</Typography>
                <TextField 
                  fullWidth type="number"
                  inputProps={{ min: 1, max: 7 }}
                  value={editData.workingDaysPerWeek || 5} 
                  onChange={e => setEditData({...editData, workingDaysPerWeek: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Break Time (Mins)</Typography>
                <TextField 
                  fullWidth type="number"
                  value={editData.breakTimeMinutes || 60} 
                  onChange={e => setEditData({...editData, breakTimeMinutes: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Professional Tax (Flat ₹)</Typography>
                <TextField 
                  fullWidth type="number"
                  value={editData.professionalTax || 200} 
                  onChange={e => setEditData({...editData, professionalTax: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>PF Percentage (%)</Typography>
                <TextField 
                  fullWidth type="number"
                  value={editData.pfPercentage || 0} 
                  onChange={e => setEditData({...editData, pfPercentage: Number(e.target.value)})}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2, borderBottomWidth: 2, borderColor: '#000' }} />
                <Typography variant="h5" sx={{ mb: 2 }}>SALARY COMPONENTS</Typography>
                
                {(editData.components || []).map((c, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <TextField 
                      label="Component Name"
                      value={c.name}
                      onChange={e => {
                        const newC = [...editData.components];
                        newC[idx].name = e.target.value;
                        setEditData({...editData, components: newC});
                      }}
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      select
                      label="Type"
                      value={c.type}
                      onChange={e => {
                        const newC = [...editData.components];
                        newC[idx].type = e.target.value;
                        setEditData({...editData, components: newC});
                      }}
                      sx={{ flex: 2 }}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              border: '2px solid #000',
                              borderRadius: '8px',
                              boxShadow: '4px 4px 0 #000'
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="percentage_of_wage">% of Wage</MenuItem>
                      <MenuItem value="percentage_of_basic">% of Basic</MenuItem>
                      <MenuItem value="fixed">Fixed ₹</MenuItem>
                    </TextField>
                    <TextField 
                      label={c.type === 'fixed' ? 'Amount (₹)' : 'Value (%)'}
                      type="number"
                      value={c.value}
                      onChange={e => {
                        const newC = [...editData.components];
                        newC[idx].value = Number(e.target.value);
                        setEditData({...editData, components: newC});
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      color="error" 
                      sx={{ border: '2px solid #000', borderRadius: '4px' }}
                      onClick={() => {
                        const newC = [...editData.components];
                        newC.splice(idx, 1);
                        setEditData({...editData, components: newC});
                      }}
                    >
                      X
                    </Button>
                  </Box>
                ))}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    sx={{ border: '2px solid #000', color: '#000', fontWeight: 800 }}
                    onClick={() => {
                      const newC = [...(editData.components || []), { name: '', type: 'percentage_of_wage', value: 0 }];
                      setEditData({...editData, components: newC});
                    }}
                  >
                    + ADD COMPONENT
                  </Button>
                  
                  <Typography variant="body1" sx={{ fontWeight: 800, color: sumPercentage > 100 ? '#b71c1c' : '#171E19' }}>
                    {sumPercentage}% of wage allocated
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 4, border: '2px solid #000', borderRadius: '12px', bgcolor: '#171E19', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '4px 4px 0 #000' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 1, opacity: 0.8 }}>TOTAL WAGE (MONTHLY)</Typography>
                <Typography variant="h2" sx={{ fontSize: '3rem', color: '#FFE17C' }}>₹{Number(salary.wage || 0).toLocaleString()}</Typography>
                
                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                <Typography variant="body2" sx={{ mb: 1 }}>Working Days: {salary.workingDaysPerWeek} days/week</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>Break Time: {salary.breakTimeMinutes} mins</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>PF: {salary.pfPercentage}%</Typography>
                <Typography variant="body2">Professional Tax: ₹{salary.professionalTax}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ p: 3, border: '2px solid #000', borderRadius: '12px', bgcolor: '#fff', height: '100%', boxShadow: '4px 4px 0 #000' }}>
                <Typography variant="h4" sx={{ mb: 3, fontSize: '1.25rem' }}>SALARY BREAKDOWN</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {salary.components && Array.isArray(salary.components) && salary.components.length > 0 ? (
                    (() => {
                      let computedBasic = 0;
                      let totalGross = 0;
                      
                      const computedComponents = salary.components.map(c => {
                        let calcVal = 0;
                        if (c.type === 'percentage_of_wage') {
                          calcVal = (Number(salary.wage) * Number(c.value)) / 100;
                          if (c.name.toLowerCase().includes('basic')) computedBasic = calcVal;
                        } else if (c.type === 'percentage_of_basic') {
                          // Note: this relies on Basic being computed first, which is standard in HRMS.
                          // If 'Basic' isn't explicitly named, fallback to 50% of wage for this calculation preview
                          const basicToUse = computedBasic > 0 ? computedBasic : (Number(salary.wage) * 0.5);
                          calcVal = (basicToUse * Number(c.value)) / 100;
                        } else if (c.type === 'fixed') {
                          calcVal = Number(c.value);
                        }
                        totalGross += calcVal;
                        return { name: c.name, val: calcVal };
                      });
                      
                      const actualBasic = computedBasic > 0 ? computedBasic : (Number(salary.wage) * 0.5);
                      const pfVal = (actualBasic * Number(salary.pfPercentage || 0)) / 100;
                      const ptVal = Number(salary.professionalTax || 0);
                      const totalDed = pfVal + ptVal;
                      const netSal = totalGross - totalDed;
                      
                      return (
                        <>
                          {computedComponents.map((c, i) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderBottom: '1px solid #ccc' }}>
                              <Typography variant="body1">{c.name}</Typography>
                              <Typography variant="body1">₹{c.val.toLocaleString()}</Typography>
                            </Box>
                          ))}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f5f5f5', border: '2px solid #000', mt: 1 }}>
                            <Typography variant="subtitle1" fontWeight="800">GROSS EARNINGS</Typography>
                            <Typography variant="subtitle1" fontWeight="800">₹{totalGross.toLocaleString()}</Typography>
                          </Box>
                          
                          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontSize: '1rem' }}>DEDUCTIONS</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderBottom: '1px solid #ccc' }}>
                            <Typography variant="body1">PF ({salary.pfPercentage}%)</Typography>
                            <Typography variant="body1">₹{pfVal.toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderBottom: '1px solid #ccc' }}>
                            <Typography variant="body1">Professional Tax</Typography>
                            <Typography variant="body1">₹{ptVal.toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#ffebee', border: '2px solid #b71c1c', mt: 1 }}>
                            <Typography variant="subtitle1" fontWeight="800" color="#b71c1c">TOTAL DEDUCTIONS</Typography>
                            <Typography variant="subtitle1" fontWeight="800" color="#b71c1c">₹{totalDed.toLocaleString()}</Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#FFE17C', border: '2px solid #000', mt: 2, borderRadius: '8px' }}>
                            <Typography variant="h5" fontWeight="900">NET SALARY</Typography>
                            <Typography variant="h5" fontWeight="900">₹{netSal.toLocaleString()}</Typography>
                          </Box>
                        </>
                      );
                    })()
                  ) : (
                    <Typography>No salary components configured.</Typography>
                  )}
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

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
          <Box sx={{ bgcolor: '#fff', border: '4px solid #000', borderRadius: '12px', p: 4, width: '90%', maxWidth: '500px', boxShadow: '8px 8px 0 #000' }}>
            <Typography variant="h3" sx={{ mb: 2 }}>Confirm Changes</Typography>
            <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
              You are updating the salary configuration for <strong>{header?.name}</strong> to a base wage of <strong>₹{Number(editData.wage || 0).toLocaleString()}</strong>.
              <br /><br />
              This will recalculate all salary components for this employee. Net salary will be recalculated on save.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setConfirmOpen(false)} variant="outlined" sx={{ border: '2px solid #000', color: '#000', fontWeight: 800 }}>CANCEL</Button>
              <Button onClick={handleSaveClick} variant="contained" sx={{ bgcolor: '#000', color: '#fff', fontWeight: 800 }}>CONFIRM & SAVE</Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeProfile;
