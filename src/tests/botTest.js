const axios = require('axios');

const API_URL = 'https://tu-api-pos.vercel.app';
const TEST_CHAT_ID = '123456789'; // Reemplaza con un chat_id real de Telegram

async function testBotSystem() {
    try {
        console.log('🚀 Iniciando pruebas del sistema de bots...\n');

        // 1. Generar código de vinculación
        console.log('1️⃣ Generando código de vinculación...');
        const generateResponse = await axios.post(`${API_URL}/bot/generate-code`, {}, {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const botCode = generateResponse.data.data.botCode;
        console.log('✅ Código generado:', botCode);

        // 2. Vincular el bot
        console.log('\n2️⃣ Vinculando bot...');
        const linkResponse = await axios.post(`${API_URL}/bot/link`, {
            botCode,
            chatId: TEST_CHAT_ID
        });
        console.log('✅ Bot vinculado:', linkResponse.data.message);

        // 3. Probar acceso autenticado
        console.log('\n3️⃣ Probando acceso autenticado...');
        const inventoryResponse = await axios.get(`${API_URL}/bot/inventory`, {
            headers: {
                'x-telegram-chat-id': TEST_CHAT_ID
            }
        });
        console.log('✅ Acceso autenticado exitoso');
        console.log('📦 Datos del inventario:', inventoryResponse.data);

        // 4. Probar desvinculación
        console.log('\n4️⃣ Probando desvinculación...');
        const unlinkResponse = await axios.post(`${API_URL}/bot/unlink`, {
            chatId: TEST_CHAT_ID
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Bot desvinculado:', unlinkResponse.data.message);

        console.log('\n✨ Todas las pruebas completadas exitosamente!');
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    }
}

// Ejecutar pruebas
testBotSystem(); 