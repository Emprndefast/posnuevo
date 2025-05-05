import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, IconButton, Stack, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';

const redes = {
  whatsapp: 'https://wa.me/18093408435',
  facebook: 'https://facebook.com/posntrd',
  instagram: 'https://instagram.com/posntrd',
  correo: 'mailto:ayudaposent@gmail.com',
};

const SoporteTecnicoModal = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ bgcolor: '#1976d2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box display="flex" alignItems="center" gap={1}>
        <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="Soporte" width={32} height={32} style={{ background: '#fff', borderRadius: '50%' }} />
        Soporte técnico POSENT
      </Box>
      <IconButton onClick={onClose} sx={{ color: '#fff' }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Typography sx={{ mb: 2 }}>
        Indícanos tu correo electrónico y tu nombre al iniciar un ticket de soporte. Por favor, incluye una breve descripción del problema.<br />
        <b>Horario de atención:</b> Lunes a Viernes de 8:00AM a 6:00PM, Sábado de 9:00AM a 12:00PM
      </Typography>
      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 3 }}>
        <IconButton component="a" href={redes.whatsapp} target="_blank" rel="noopener" sx={{ bgcolor: '#25D366', color: '#fff', '&:hover': { bgcolor: '#1ebe57' }, width: 64, height: 64 }}>
          <WhatsAppIcon sx={{ fontSize: 40 }} />
        </IconButton>
        <IconButton component="a" href={redes.facebook} target="_blank" rel="noopener" sx={{ bgcolor: '#1877f3', color: '#fff', '&:hover': { bgcolor: '#145db2' }, width: 64, height: 64 }}>
          <FacebookIcon sx={{ fontSize: 40 }} />
        </IconButton>
        <IconButton component="a" href={redes.instagram} target="_blank" rel="noopener" sx={{ bgcolor: '#E1306C', color: '#fff', '&:hover': { bgcolor: '#b81e53' }, width: 64, height: 64 }}>
          <InstagramIcon sx={{ fontSize: 40 }} />
        </IconButton>
        <IconButton component="a" href={redes.correo} target="_blank" rel="noopener" sx={{ bgcolor: '#607d8b', color: '#fff', '&:hover': { bgcolor: '#455a64' }, width: 64, height: 64 }}>
          <EmailIcon sx={{ fontSize: 40 }} />
        </IconButton>
      </Stack>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>Teléfono de soporte:</b> <Button href="tel:+18093408435" sx={{ textTransform: 'none' }}>+1 809 340 8435</Button>
        </Typography>
        <Typography variant="body1">
          <b>Correo:</b> <Button href="mailto:ayudaposent@gmail.com" sx={{ textTransform: 'none' }}>ayudaposent@gmail.com</Button>
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
        Síguenos en redes: <b>@posntrd</b>
      </Typography>
    </DialogContent>
  </Dialog>
);

export default SoporteTecnicoModal; 