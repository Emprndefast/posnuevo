import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import messages from '../config/messages/messages';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null);
      return { success: true, message: messages.auth.login.success };
    } catch (err) {
      setError(err.message);
      return { success: false, message: messages.auth.login.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      setUser(userCredential.user);
      setError(null);
      return { success: true, message: messages.auth.register.success };
    } catch (err) {
      setError(err.message);
      return { success: false, message: messages.auth.register.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
      navigate('/login');
      return { success: true, message: messages.auth.logout.success };
    } catch (err) {
      setError(err.message);
      return { success: false, message: messages.auth.logout.error };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    try {
      await auth.sendPasswordResetEmail(email);
      setError(null);
      return { success: true, message: messages.auth.resetPassword.success };
    } catch (err) {
      setError(err.message);
      return { success: false, message: messages.auth.resetPassword.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, updates);
      setUser(prev => ({ ...prev, ...updates }));
      setError(null);
      return { success: true, message: messages.auth.updateProfile.success };
    } catch (err) {
      setError(err.message);
      return { success: false, message: messages.auth.updateProfile.error };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    setUser
  };
};

export default useAuth; 