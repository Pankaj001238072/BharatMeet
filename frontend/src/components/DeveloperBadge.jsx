import React from 'react';
import { Box } from '@mui/material';

export default function DeveloperBadge({ position = 'right', hideOnMobile = false }) {
  return (
    <Box sx={{
      position: 'fixed',
      bottom: { xs: '4px', sm: '20px' },
      ...(position === 'left' ? { left: { xs: '6px', sm: '20px' } } : { right: { xs: '6px', sm: '20px' } }),
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      padding: { xs: '4px 12px 4px 4px', sm: '8px 16px 8px 8px' },
      borderRadius: '50px',
      alignItems: 'center',
      gap: { xs: '8px', sm: '12px' },
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      zIndex: 1000,
      display: hideOnMobile ? { xs: 'none', md: 'flex' } : 'flex',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
    }}>
      <Box 
        component="img"
        src="https://res.cloudinary.com/dxn4y5zlg/image/upload/v1773248409/Screenshot_20260118-075954_3_vrp14n.jpg" 
        alt="Pankaj Avatar" 
        sx={{
          width: { xs: '24px', sm: '32px' },
          height: { xs: '24px', sm: '32px' },
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #FF9839'
        }}
      />
      <Box component="span" sx={{
        color: 'white',
        fontSize: { xs: '0.75rem', sm: '0.9rem' },
        fontWeight: 600,
        letterSpacing: '0.5px'
      }}>
        Developed by <span style={{ color: '#FF9839' }}>Pankaj</span>
      </Box>
    </Box>
  );
}
