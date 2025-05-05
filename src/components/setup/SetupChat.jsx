import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, Paper, Avatar, Fade, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChatMessage from '../common/ChatMessage';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const isYesNoQuestion = (question) => {
  return question && question.toLowerCase().includes('(sí/no)');
};

const SetupChat = ({ chatHistory, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const theme = useTheme();

  // Detectar si la última pregunta es de sí/no
  const lastMsg = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
  const isYesNo = lastMsg && lastMsg.role === 'assistant' && isYesNoQuestion(lastMsg.content);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (inputRef.current && showInput) {
      inputRef.current.focus();
    }
    if (isYesNo) {
      setShowInput(false);
    } else {
      setShowInput(true);
    }
  }, [chatHistory, isLoading, isYesNo, showInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleQuickAnswer = (answer) => {
    if (answer === 'otra') {
      setShowInput(true);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    } else {
      onSendMessage(answer);
      setInput('');
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2, bgcolor: theme.palette.background.default, borderRadius: 3, boxShadow: 3 }}>
      <List sx={{ maxHeight: 400, overflow: 'auto', pb: 0 }}>
        {chatHistory.map((msg, index) => (
          <Fade in key={index} timeout={400}>
            <ListItem sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: msg.role === 'assistant' ? 'flex-start' : 'flex-end', border: 'none', bgcolor: 'transparent' }}>
              {msg.role === 'assistant' && (
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1, width: 32, height: 32 }}>
                  <SmartToyIcon fontSize="small" />
                </Avatar>
              )}
              <Box
                sx={{
                  p: 1.5,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: msg.role === 'assistant' ? theme.palette.primary.light : theme.palette.secondary.light,
                  color: msg.role === 'assistant' ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
                  boxShadow: msg.role === 'assistant' ? 2 : 1,
                  maxWidth: '70%',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  wordBreak: 'break-word',
                  transition: 'background 0.3s',
                }}
              >
                {msg.content}
              </Box>
              {msg.role === 'user' && (
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, ml: 1, width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              )}
            </ListItem>
          </Fade>
        ))}
        <div ref={messagesEndRef} />
      </List>
      {isYesNo && !showInput ? (
        <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => handleQuickAnswer('sí')} disabled={isLoading}>Sí</Button>
          <Button variant="contained" color="error" onClick={() => handleQuickAnswer('no')} disabled={isLoading}>No</Button>
          <Button variant="outlined" onClick={() => handleQuickAnswer('otra')} disabled={isLoading}>Otra opción</Button>
        </Stack>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu respuesta..."
            disabled={isLoading}
            inputRef={inputRef}
            sx={{
              bgcolor: '#f8fafc',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              px: 3,
              fontWeight: 700,
              borderRadius: 2,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              textTransform: 'none',
            }}
            disabled={isLoading || !input.trim()}
          >
            Enviar
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SetupChat; 