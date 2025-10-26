// Firebase config - COMPLETELY REMOVED - Using MongoDB backend only
console.warn('[Firebase] This file is deprecated. Use MongoDB API instead.');

// Export null for backwards compatibility only
export const app = null;
export const auth = null;
export const db = {}; // Objeto vacío en lugar de null para evitar errores
export const storage = null;
export const analytics = null;
export const getAuth = () => null;
export const getFirestore = () => null;
export const getStorage = () => null;
export const initializeApp = () => null;

// Firestore operations - NO-OP functions that return appropriate values
export const collection = () => [];
export const doc = () => ({ id: '', data: () => null });
export const getDoc = () => Promise.resolve({ exists: () => false, data: () => null });
export const getDocs = () => Promise.resolve({ docs: [], empty: true, size: 0 });
export const addDoc = () => Promise.resolve({ id: '' });
export const updateDoc = () => Promise.resolve();
export const deleteDoc = () => Promise.resolve();
export const setDoc = () => Promise.resolve();
export const onSnapshot = () => () => {};
export const query = (...args) => []; // Retornar array vacío en lugar de null
export const where = (field, operator, value) => ({ field, operator, value });
export const orderBy = () => ({});
export const startAt = () => ({});
export const endAt = () => ({});
export const limit = () => ({});
export const Timestamp = { 
  now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000 }),
  fromDate: (d) => ({ toDate: () => d, seconds: d.getTime() / 1000 }),
  toDate: (t) => t && t.toDate ? t.toDate() : new Date(t)
};

export const ref = () => null;
export const uploadBytes = () => Promise.resolve();
export const getDownloadURL = () => Promise.resolve('');
export const enableIndexedDbPersistence = () => Promise.resolve();
export const uploadString = () => Promise.resolve();

// Missing functions that were causing errors
export const writeBatch = () => ({
  set: () => {},
  update: () => {},
  delete: () => {},
  commit: () => Promise.resolve()
});
export const serverTimestamp = () => new Date();

// Auth functions
export const signInWithEmailAndPassword = () => Promise.reject(new Error('Firebase Auth deprecated - use MongoDB API'));
export const signOut = () => Promise.resolve();
export const createUserWithEmailAndPassword = () => Promise.reject(new Error('Firebase Auth deprecated - use MongoDB API'));
export const sendPasswordResetEmail = () => Promise.reject(new Error('Firebase Auth deprecated - use MongoDB API'));
export const updateProfile = () => Promise.resolve();
export const onAuthStateChanged = () => () => {};

// Firebase Functions
export const getFunctions = () => null;
export const httpsCallable = () => () => Promise.resolve({ data: null });

// Firebase Messaging
export const getMessaging = () => null;
export const getToken = () => Promise.resolve('');
export const onMessage = () => () => {};

// Additional missing functions
export const startAfter = () => null;
export const deleteObject = () => Promise.resolve();
