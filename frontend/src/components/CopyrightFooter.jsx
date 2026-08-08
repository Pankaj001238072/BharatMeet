import React from 'react';

import { Box } from '@mui/material';

export default function CopyrightFooter({ sx = {} }) {
  return (
    <Box sx={{
      position: "absolute",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      color: "rgba(255, 255, 255, 0.6)",
      fontSize: { xs: "0.7rem", sm: "0.85rem" },
      textAlign: "center",
      zIndex: 10,
      width: "100%",
      ...sx
    }}>
      &copy; {new Date().getFullYear()} BharatMeet. All rights reserved.
    </Box>
  );
}
