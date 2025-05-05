const { execSync } = require('child_process');
const readline = require('readline');

// Crear interfaz para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para solicitar información al usuario
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Función principal
async function main() {
  console.log('🤖 Pruebas de conexión con el bot de Telegram');
  console.log('============================================');
  
  // Solicitar token y chat ID
  const botToken = await askQuestion('Ingresa el token de tu bot de Telegram: ');
  const chatId = await askQuestion('Ingresa el ID del chat de Telegram: ');
  
  console.log('\n🔄 Actualizando scripts de prueba con tus credenciales...');
  
  // Actualizar los scripts de prueba con las credenciales proporcionadas
  try {
    // Actualizar botConnection.cjs
    execSync(`node -e "const fs=require('fs');const path=require('path');const file=path.join(process.cwd(),'src','tests','botConnection.cjs');let content=fs.readFileSync(file,'utf8');content=content.replace(/botToken: ['"].*['"]/, 'botToken: \"${botToken}\"');content=content.replace(/chatId: ['"].*['"]/, 'chatId: \"${chatId}\"');fs.writeFileSync(file,content);"`);
    
    // Actualizar vercelBotTest.js
    execSync(`node -e "const fs=require('fs');const path=require('path');const file=path.join(process.cwd(),'src','tests','vercelBotTest.js');let content=fs.readFileSync(file,'utf8');content=content.replace(/botToken: ['"].*['"]/, 'botToken: \"${botToken}\"');content=content.replace(/chatId: ['"].*['"]/, 'chatId: \"${chatId}\"');fs.writeFileSync(file,content);"`);
    
    console.log('✅ Scripts actualizados correctamente');
  } catch (error) {
    console.error('❌ Error al actualizar los scripts:', error.message);
    rl.close();
    return;
  }
  
  // Menú de opciones
  console.log('\n📋 Opciones de prueba:');
  console.log('1. Probar conexión con Telegram API directamente');
  console.log('2. Probar conexión con el bot en Vercel');
  console.log('3. Probar ambas conexiones');
  console.log('4. Salir');
  
  const option = await askQuestion('\nSelecciona una opción (1-4): ');
  
  switch (option) {
    case '1':
      console.log('\n🔄 Ejecutando prueba de conexión con Telegram API...');
      execSync('node src/tests/botConnection.cjs', { stdio: 'inherit' });
      break;
    case '2':
      console.log('\n🔄 Ejecutando prueba de conexión con el bot en Vercel...');
      execSync('node src/tests/vercelBotTest.js', { stdio: 'inherit' });
      break;
    case '3':
      console.log('\n🔄 Ejecutando prueba de conexión con Telegram API...');
      execSync('node src/tests/botConnection.cjs', { stdio: 'inherit' });
      console.log('\n🔄 Ejecutando prueba de conexión con el bot en Vercel...');
      execSync('node src/tests/vercelBotTest.js', { stdio: 'inherit' });
      break;
    case '4':
      console.log('👋 ¡Hasta luego!');
      break;
    default:
      console.log('❌ Opción no válida');
  }
  
  rl.close();
}

// Ejecutar la función principal
main(); 