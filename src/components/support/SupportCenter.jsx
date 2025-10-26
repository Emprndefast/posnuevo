import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Help as HelpIcon,
  Chat as ChatIcon,
  Book as BookIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContextMongo';

const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'medium' });
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadTickets();
    loadKnowledgeBase();
  }, []);

  const loadTickets = async () => {
    try {
      const q = query(
        collection(db, 'support_tickets'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ticketList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTickets(ticketList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading tickets:', error);
      setLoading(false);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const q = query(collection(db, 'knowledge_base'), orderBy('title'));
      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setKnowledgeBase(articles);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  };

  const handleCreateTicket = async () => {
    try {
      await addDoc(collection(db, 'support_tickets'), {
        ...newTicket,
        userId: user.uid,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setNewTicket({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await addDoc(collection(db, 'chat_messages'), {
        userId: user.uid,
        message: newMessage,
        timestamp: new Date()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <ErrorIcon color="error" />;
      case 'in_progress': return <AccessTimeIcon color="warning" />;
      case 'closed': return <CheckCircleIcon color="success" />;
      default: return <HelpIcon />;
    }
  };

  const filteredKnowledgeBase = knowledgeBase.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Centro de Soporte
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<HelpIcon />} label="Tickets" />
          <Tab icon={<ChatIcon />} label="Chat en Vivo" />
          <Tab icon={<BookIcon />} label="Base de Conocimientos" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Crear Nuevo Ticket
          </Typography>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descripción"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleCreateTicket}
                  disabled={!newTicket.title || !newTicket.description}
                >
                  Crear Ticket
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="h6" gutterBottom>
            Mis Tickets
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <List>
              {tickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(ticket.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={ticket.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {ticket.description}
                          </Typography>
                          <br />
                          <Chip
                            size="small"
                            label={ticket.priority}
                            color={getPriorityColor(ticket.priority)}
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            size="small"
                            label={ticket.status}
                            variant="outlined"
                          />
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            onClick={() => setChatOpen(true)}
          >
            Iniciar Chat
          </Button>

          <Dialog
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Chat en Vivo
              <IconButton
                aria-label="close"
                onClick={() => setChatOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
                {chatMessages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.userId === user.uid ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        maxWidth: '70%',
                        bgcolor: message.userId === user.uid ? 'primary.main' : 'grey.100',
                        color: message.userId === user.uid ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body2">{message.message}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar en la base de conocimientos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ mb: 3 }}
          />

          <Grid container spacing={3}>
            {filteredKnowledgeBase.map((article) => (
              <Grid item xs={12} md={6} key={article.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {article.content.substring(0, 200)}...
                    </Typography>
                    <Button
                      variant="text"
                      color="primary"
                      sx={{ mt: 1 }}
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      Leer más
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default SupportCenter; 