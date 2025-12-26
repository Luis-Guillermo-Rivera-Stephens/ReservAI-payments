const getdbinfo = async () => {
    // Si existe DATABASE_URL, usarla directamente
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    
    // Obtener todas las variables de entorno de la base de datos
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    const dbName = process.env.DB_NAME;
    const dbSSL = process.env.DB_SSL;
    
    // Verificar que todas las variables estén definidas
    if (!dbUser || !dbPassword || !dbHost || !dbPort || !dbName) {
        throw new Error('Variables de entorno de la base de datos no están definidas. Verifica tu archivo .env');
    }
    
    // Construir y retornar solo la URL de conexión (sin sslmode para usar nuestra configuración SSL)
    console.log(`postgresql://${dbUser}:**********@${dbHost}:${dbPort}/${dbName}`)
    const dbUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
    
    return dbUrl;
}

module.exports = getdbinfo;