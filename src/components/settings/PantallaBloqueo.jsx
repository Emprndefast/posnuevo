import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Alert, Fade } from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';

const FRASES = [
  '¡Bienvenido! Toca la pantalla para continuar...',
  'Tu seguridad es importante para nosotros.',
  '¿Sabías que puedes personalizar tu PIN en configuración?',
  'Mantén tu información protegida.',
  '¡Gracias por usar nuestro sistema!',
  'Presiona cualquier parte para desbloquear...',
  'Recuerda: nunca compartas tu PIN con nadie.',
  'La seguridad es la clave del éxito.',
  '¿Ya hiciste tu respaldo hoy?',
  'Un sistema seguro es un sistema confiable.',
  '¡Sigue creciendo con nosotros!',
  'La protección de tus datos es nuestra prioridad.',
  'Toca para acceder a tu espacio seguro.',
  '¿Sabías que puedes cambiar el fondo en configuración?',
  '¡Disfruta de una experiencia segura y moderna!',
  'La confianza comienza con la seguridad.',
  '¡Tu información está en buenas manos!',
  'Haz clic o toca para continuar con tu trabajo.',
  '¿Listo para un día productivo?'
];

const INTERVALO_FRASE = 5000; // 5 segundos
const FADE_MS = 1200; // 1.2 segundos

const PantallaBloqueo = ({ onUnlock, onLogout, pinGuardado }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [mostrarCuadro, setMostrarCuadro] = useState(false);
  const [fraseIdx, setFraseIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 2 - 1
        });
      }
    };
    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Frases animadas en modo espera
  useEffect(() => {
    if (mostrarCuadro) return;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setFraseIdx((prev) => (prev + 1) % FRASES.length);
        setFadeIn(true);
      }, FADE_MS); // tiempo de desvanecimiento
    }, INTERVALO_FRASE);
    return () => clearInterval(interval);
  }, [mostrarCuadro]);

  // Mostrar el cuadro al hacer clic o tocar la pantalla
  useEffect(() => {
    if (mostrarCuadro) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return;
    }
    const handleShow = () => setMostrarCuadro(true);
    window.addEventListener('mousedown', handleShow);
    window.addEventListener('touchstart', handleShow);
    return () => {
      window.removeEventListener('mousedown', handleShow);
      window.removeEventListener('touchstart', handleShow);
    };
  }, [mostrarCuadro]);

  useEffect(() => {
    // Cuando el cuadro se muestre por cualquier motivo, enfocar el input
    if (mostrarCuadro) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [mostrarCuadro]);

  const handleUnlock = () => {
    if (pin === pinGuardado) {
      setPin('');
      setError('');
      setIntentos(0);
      onUnlock();
    } else {
      setError('PIN incorrecto');
      setIntentos(prev => prev + 1);
      setPin('');
      if (intentos + 1 >= 3) {
        onLogout();
      }
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleUnlock();
  };

  return (
    <Box sx={{
      position: 'fixed',
      zIndex: 20000,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      transition: 'all 0.3s',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      cursor: mostrarCuadro ? 'default' : 'pointer',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      {!mostrarCuadro && (
        <Fade in={fadeIn} timeout={FADE_MS}>
          <Typography
            variant="h5"
            sx={{
              color: '#38bdf8',
              zIndex: 1,
              textAlign: 'center',
              fontWeight: 500,
              px: 2,
              position: 'relative',
              userSelect: 'none',
              textShadow: '0 2px 8px #000a',
            }}
          >
            {FRASES[fraseIdx]}
          </Typography>
        </Fade>
      )}
      {mostrarCuadro && (
        <Box sx={{ zIndex: 2, p: 4, borderRadius: 3, bgcolor: 'rgba(20,20,20,0.85)', boxShadow: 6, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Lock sx={{ fontSize: 48, color: '#38bdf8', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#fff', mb: 2, textAlign: 'center' }}>
          Sistema bloqueado. Ingresa tu PIN para continuar.
        </Typography>
        <TextField
          label="PIN"
          type={showPin ? 'text' : 'password'}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={handleKeyDown}
            inputRef={inputRef}
          autoFocus
          inputProps={{ maxLength: 8, style: { textAlign: 'center', letterSpacing: 6, fontSize: 24, color: '#38bdf8' } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPin(v => !v)} edge="end" tabIndex={-1}>
                  {showPin ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
            sx={{ mb: 2, bgcolor: '#222', borderRadius: 2, input: { color: '#38bdf8' }, zIndex: 3 }}
        />
        <Button variant="contained" color="primary" onClick={handleUnlock} sx={{ mb: 1, minWidth: 120 }}>
          Desbloquear
        </Button>
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        {intentos > 0 && <Typography sx={{ color: '#fff', mt: 1, fontSize: 13 }}>Intentos: {intentos} / 3</Typography>}
      </Box>
      )}
    </Box>
  );
};

export default PantallaBloqueo; 
