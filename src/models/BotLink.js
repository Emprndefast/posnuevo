const { db } = require('../firebase/config');

class BotLink {
    static collection = db.collection('bot_links');

    static async createLink(userId, botCode, chatId) {
        const linkData = {
            userId,
            botCode,
            chatId,
            createdAt: new Date(),
            isActive: true
        };

        const docRef = await this.collection.add(linkData);
        return { id: docRef.id, ...linkData };
    }

    static async findByBotCode(botCode) {
        const snapshot = await this.collection
            .where('botCode', '==', botCode)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async findByChatId(chatId) {
        const snapshot = await this.collection
            .where('chatId', '==', chatId)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async deactivateLink(linkId) {
        await this.collection.doc(linkId).update({
            isActive: false,
            deactivatedAt: new Date()
        });
    }
}

module.exports = BotLink; 