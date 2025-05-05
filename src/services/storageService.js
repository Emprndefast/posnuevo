import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { getAuth } from 'firebase/auth';

class StorageService {
  async uploadProductImage(file) {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Crear referencia en Storage
      const storageRef = ref(storage, `productos/${file.name}`);
      
      // Subir archivo
      const snapshot = await uploadBytes(storageRef, file);
      
      // Obtener URL pública
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: `productos/${file.name}`,
        filename: file.name
      };
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw this.handleError(error);
    }
  }

  // Subir imagen de perfil a Cloudinary
  async uploadProfileImage(file) {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    data.append('cloud_name', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
    const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: data
      });
      const json = await res.json();
      if (!json.secure_url) throw new Error('Error al subir imagen a Cloudinary');
      return {
        url: json.secure_url,
        public_id: json.public_id
      };
    } catch (error) {
      console.error('Error al subir imagen a Cloudinary:', error);
      throw new Error('Error al subir imagen a Cloudinary');
    }
  }

  handleError(error) {
    if (error.message === 'Usuario no autenticado') {
      return new Error('Debes iniciar sesión para subir imágenes');
    }
    
    switch (error.code) {
      case 'storage/unauthorized':
        return new Error('No tienes permisos para realizar esta acción');
      case 'storage/canceled':
        return new Error('Subida cancelada');
      case 'storage/unknown':
        return new Error('Error desconocido al subir la imagen');
      default:
        return new Error('Error al subir la imagen. Por favor, intenta de nuevo');
    }
  }
}

const storageService = new StorageService();
export default storageService; 