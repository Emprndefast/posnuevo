import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ChatMessage = ({ role, content }) => {
  const isAssistant = role === 'assistant';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isAssistant ? 'flex-start' : 'flex-end',
        mb: 2,
        width: '100%'
      }}
    >
      <Paper
        sx={{
          p: 2,
          maxWidth: '70%',
          bgcolor: isAssistant ? 'primary.light' : 'secondary.light',
          color: isAssistant ? 'primary.contrastText' : 'secondary.contrastText'
        }}
      >
        <Typography variant="body1">{content}</Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage; 