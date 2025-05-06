import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Cargar datos extra de Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              ...userSnap.data()
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName
            });
          }
        } catch (err) {
          console.error('Error al cargar datos de Firestore:', err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error('Error en el estado de autenticación:', error);
      setError(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Cargar datos extra de Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          ...userSnap.data()
        });
      } else {
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        });
      }
      return userCredential.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Cargar datos extra de Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          ...userSnap.data()
        });
      } else {
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        });
      }
      return userCredential.user;
    } catch (error) {
      console.error('Error al registrar:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      if (typeof navigate === 'function') {
        navigate('/login');
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reloadUser = async () => {
    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...userSnap.data()
          });
        }
      } catch (err) {
        console.error('Error al recargar datos de usuario:', err);
      }
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    reloadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 