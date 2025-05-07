import React from 'react';
import { Box, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';

function Logo({ size = 'medium', variant = 'default' }) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { icon: 20, text: 'h6' };
      case 'large':
        return { icon: 40, text: 'h4' };
      default:
        return { icon: 30, text: 'h5' };
    }
  };

  const { icon, text } = getSize();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: variant === 'white' ? 'white' : 'primary.main',
      }}
    >
      <AccessTime sx={{ fontSize: icon }} />
      <Typography
        variant={text}
        sx={{
          fontWeight: 'bold',
          letterSpacing: '0.5px',
        }}
      >
        ShiftPlanner
      </Typography>
    </Box>
  );
}

export default Logo; 