// Al expirar el trial, marcar usuario como trialUsed y blocked
async blockUserAfterTrial(userId) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      trialUsed: true,
      blocked: true,
      blockedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error bloqueando usuario tras trial:', error);
    throw error;
  }
},

// Validar si un email o teléfono ya usó trial o está bloqueado
async isUserBlockedByEmailOrPhone(email, phone) {
  try {
    let q = query(collection(db, 'users'), where('email', '==', email));
    let snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const user = snapshot.docs[0].data();
      if (user.trialUsed || user.blocked) return true;
    }
    if (phone) {
      q = query(collection(db, 'users'), where('phone', '==', phone));
      snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const user = snapshot.docs[0].data();
        if (user.trialUsed || user.blocked) return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error validando usuario bloqueado:', error);
    throw error;
  }
},

// En handleExpiredTrials, llamar a blockUserAfterTrial tras borrar datos
async handleExpiredTrials() {
  try {
    const q = query(
      collection(db, 'users'),
      where('isTrial', '==', true),
      where('status', '!=', 'deleted')
    );
    const snapshot = await getDocs(q);
    const now = Timestamp.now();
    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data();
      if (userData.trialEndDate.toDate() < now.toDate()) {
        await this.deleteUserData(docSnap.id);
        await this.blockUserAfterTrial(docSnap.id);
      }
    }
  } catch (error) {
    console.error('Error handling expired trials:', error);
    throw error;
  }
}, 