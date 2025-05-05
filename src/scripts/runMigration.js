import migrateDatabase from './migrateDatabase';

const runMigration = async () => {
  try {
    console.log('Iniciando proceso de migración...');
    
    // Ejecutar migración
    await migrateDatabase();
    
    console.log('Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
};

// Ejecutar migración
runMigration(); 