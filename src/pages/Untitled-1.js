// ...dentro del <Grid item xs={12} sm={6} md={4}> para Cambiar Contraseña...
<Paper
  elevation={2}
  sx={{
    p: 2,
    borderRadius: '10px',
    bgcolor: darkMode ? '#333' : '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }}
>
  <Box
    sx={{
      bgcolor: 'secondary.main',
      color: '#fff',
      borderRadius: '50%',
      width: 56,
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 2,
    }}
  >
    <LockIcon fontSize="large" />
  </Box>
  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
    Cambiar Contraseña
  </Typography>
  <TextField
    label="Contraseña Actual"
    type="password"
    fullWidth
    margin="dense"
    value={claveActual}
    onChange={e => setClaveActual(e.target.value)}
    sx={{ mb: 1 }}
    autoComplete="current-password"
  />
  <TextField
    label="Nueva Contraseña"
    type="password"
    fullWidth
    margin="dense"
    value={nuevaClave}
    onChange={e => setNuevaClave(e.target.value)}
    sx={{ mb: 1 }}
    autoComplete="new-password"
  />
  <TextField
    label="Repetir Nueva Contraseña"
    type="password"
    fullWidth
    margin="dense"
    value={repetirClave}
    onChange={e => setRepetirClave(e.target.value)}
    sx={{ mb: 2 }}
    autoComplete="new-password"
  />
  <Button
    variant="outlined"
    color="primary"
    sx={{ fontWeight: 'bold', borderRadius: 2, mt: 1 }}
    onClick={handleCambiarClave}
    fullWidth
    type="button"
  >
    Cambiar Contraseña
  </Button>
</Paper>