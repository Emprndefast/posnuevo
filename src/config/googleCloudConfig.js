const googleCloudConfig = {
  projectId: process.env.REACT_APP_GOOGLE_CLOUD_PROJECT_ID,
  bucketName: process.env.REACT_APP_GOOGLE_CLOUD_BUCKET_NAME,
  credentials: {
    client_email: process.env.REACT_APP_GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.REACT_APP_GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  paths: {
    uploads: 'uploads/',
    businessLogos: 'business/logos/',
    userAvatars: 'users/avatars/',
    products: 'products/'
  },
  maxFileSize: {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024 // 10MB
  },
  allowedMimeTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};

export default googleCloudConfig; 