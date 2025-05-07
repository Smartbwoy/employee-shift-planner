import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Work,
  AccessTime,
  Edit,
  Save,
  Cancel,
  LocationOn,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

// Dummy data for development
const dummyProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  phone: '+1 (555) 123-4567',
  position: 'Senior Developer',
  department: 'Engineering',
  location: 'New York Office',
  preferredWorkingHours: '9:00 AM - 5:00 PM, Monday to Friday',
  skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
  bio: 'Experienced software developer with a passion for creating efficient and scalable applications.',
};

const dummyShifts = [
  {
    id: 1,
    startTime: '2024-03-20T09:00:00',
    endTime: '2024-03-20T17:00:00',
  },
  {
    id: 2,
    startTime: '2024-03-21T09:00:00',
    endTime: '2024-03-21T17:00:00',
  },
  {
    id: 3,
    startTime: '2024-03-22T09:00:00',
    endTime: '2024-03-22T17:00:00',
  },
];

function Profile() {
  const [profile, setProfile] = useState(dummyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [upcomingShifts, setUpcomingShifts] = useState(dummyShifts);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    // Comment: In production, uncomment these API calls
    // fetchProfile();
    // fetchUpcomingShifts();
    
    // Using dummy data for now
    calculateTotalHours(dummyShifts);
  }, []);

  // API Endpoints:
  // GET /api/employee/profile - Fetch employee profile
  // PUT /api/employee/profile - Update employee profile
  // GET /api/schedule/upcoming - Fetch upcoming shifts for the employee
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://employeeschedulerapi.azurewebsites.net/api/employee/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchUpcomingShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://employeeschedulerapi.azurewebsites.net/api/schedule/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpcomingShifts(response.data);
      calculateTotalHours(response.data);
    } catch (error) {
      console.error('Failed to fetch upcoming shifts:', error);
    }
  };

  const calculateTotalHours = (shifts) => {
    const total = shifts.reduce((acc, shift) => {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      const hours = (end - start) / (1000 * 60 * 60);
      return acc + hours;
    }, 0);
    setTotalHours(total);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Comment: In production, uncomment the API call
    // try {
    //   const token = localStorage.getItem('token');
    //   await axios.put('https://employeeschedulerapi.azurewebsites.net/api/employee/profile', profile, {
    //     headers: { Authorization: `Bearer ${token}` }
    //   });
    //   setSuccess('Profile updated successfully');
    //   setIsEditing(false);
    //   setTimeout(() => setSuccess(''), 3000);
    // } catch (error) {
    //   setError('Failed to update profile');
    //   setTimeout(() => setError(''), 3000);
    // }

    // Using dummy success for now
    setSuccess('Profile updated successfully (Dummy)');
    setIsEditing(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mb: 2,
                }}
              >
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {profile.position}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={profile.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={profile.phone} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText primary="Location" secondary={profile.location} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Work />
                </ListItemIcon>
                <ListItemText primary="Department" secondary={profile.department} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Edit Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Profile Information</Typography>
              <Button
                variant={isEditing ? "outlined" : "contained"}
                startIcon={isEditing ? <Cancel /> : <Edit />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    name="position"
                    value={profile.position}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Preferred Working Hours"
                    name="preferredWorkingHours"
                    value={profile.preferredWorkingHours}
                    onChange={handleChange}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    multiline
                    rows={4}
                  />
                </Grid>
                {isEditing && (
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Save Changes
                    </Button>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>

          {/* Upcoming Shifts */}
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Shifts
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" color="textSecondary">
                Total Hours: {totalHours.toFixed(1)}
              </Typography>
            </Box>
            <List>
              {upcomingShifts.map((shift) => (
                <ListItem key={shift.id}>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText
                    primary={format(new Date(shift.startTime), 'EEEE, MMMM d, yyyy')}
                    secondary={`${format(new Date(shift.startTime), 'HH:mm')} - ${format(new Date(shift.endTime), 'HH:mm')}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile; 