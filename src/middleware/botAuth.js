const BotLink = require('../models/BotLink');
const { db } = require('../firebase/config');

const botAuth = async (req, res, next) => {
    try {
        const chatId = req.headers['x-telegram-chat-id'];
        
        if (!chatId) {
            return res.status(401).json({
                success: false,
                message: 'Se requiere el chat_id de Telegram'
            });
        }

        // Buscar el vínculo del bot
        const botLink = await BotLink.findByChatId(chatId);
        
        if (!botLink) {
            return res.status(401).json({
                success: false,
                message: 'Bot no vinculado o vínculo inactivo'
            });
        }

        // Verificar que el usuario existe y está activo
        const userDoc = await db.collection('users').doc(botLink.userId).get();
        
        if (!userDoc.exists) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const userData = userDoc.data();
        
        if (!userData.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Verificar suscripción válida
        if (!userData.subscription || userData.subscription.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Suscripción no válida o inactiva'
            });
        }

        // Adjuntar información del usuario a la petición
        req.user = {
            id: botLink.userId,
            ...userData,
            botLink: botLink
        };

        next();
    } catch (error) {
        console.error('Error en botAuth:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = botAuth; 