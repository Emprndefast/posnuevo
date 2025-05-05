const { Storage } = require('@google-cloud/storage');

async function initializeBucket() {
  try {
    const storage = new Storage({
      projectId: process.env.REACT_APP_GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.REACT_APP_GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.REACT_APP_GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n')
      }
    });

    const bucketName = process.env.REACT_APP_GOOGLE_CLOUD_BUCKET_NAME;
    
    // Verificar si el bucket existe
    const [buckets] = await storage.getBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      // Crear el bucket si no existe
      await storage.createBucket(bucketName, {
        location: 'us-central1',
        storageClass: 'STANDARD',
      });
      console.log(`Bucket ${bucketName} creado exitosamente.`);
    } else {
      console.log(`Bucket ${bucketName} ya existe.`);
    }

    const bucket = storage.bucket(bucketName);

    // Configurar CORS para permitir acceso desde tu dominio
    await bucket.setCorsConfiguration([{
      maxAgeSeconds: 3600,
      method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
      origin: ['http://localhost:3000', 'https://tu-dominio.com'],
      responseHeader: ['Content-Type', 'Access-Control-Allow-Origin']
    }]);

    // Configurar IAM para permitir acceso público solo a archivos específicos
    const policy = await bucket.iam.getPolicy();
    policy.bindings.push({
      role: 'roles/storage.objectViewer',
      members: ['allUsers'],
      condition: {
        title: 'Public access to images',
        description: 'Allow public access to image files',
        expression: 'resource.name.startsWith("business/logos/") || resource.name.startsWith("users/avatars/") || resource.name.startsWith("products/")'
      }
    });
    await bucket.iam.setPolicy(policy);

    console.log('Configuración de permisos actualizada.');

    // Crear carpetas base
    const folders = ['uploads/', 'business/logos/', 'users/avatars/', 'products/'];
    for (const folder of folders) {
      const file = bucket.file(folder);
      await file.save('');
      console.log(`Carpeta ${folder} creada.`);
    }

  } catch (error) {
    console.error('Error al inicializar Google Cloud:', error);
  }
}

initializeBucket(); 