const crypto = require('crypto');

function generateBotCode() {
    // Generar un número aleatorio de 5 dígitos
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    
    // Crear un hash único basado en el timestamp y el número aleatorio
    const timestamp = Date.now();
    const hash = crypto
        .createHash('sha256')
        .update(`${timestamp}${randomNumber}`)
        .digest('hex')
        .substring(0, 3)
        .toUpperCase();
    
    // Combinar para formar el código BOTXXXXX
    return `BOT${hash}${randomNumber}`;
}

module.exports = {
    generateBotCode
}; 