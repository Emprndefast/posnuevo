const { spawn } = require('child_process');
const path = require('path');

// Función para iniciar un proceso
function startProcess(command, args, options) {
  const process = spawn(command, args, options);
  
  process.stdout.on('data', (data) => {
    console.log(`POS: ${data}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`POS Error: ${data}`);
  });

  process.on('close', (code) => {
    console.log(`POS proceso terminado con código ${code}`);
  });

  return process;
}

// Iniciar solo el servidor de desarrollo de React
const posServer = startProcess('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname)
});

// Manejar la terminación del proceso
process.on('SIGINT', () => {
  console.log('Deteniendo servidor...');
  posServer.kill();
  process.exit();
}); 