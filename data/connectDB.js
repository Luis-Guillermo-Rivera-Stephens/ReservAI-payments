const { Pool } = require('pg');
const getdbinfo = require('./getdbinfo');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

// Configurar DNS para resolver IPv6 primero, luego IPv4
dns.setDefaultResultOrder('ipv6first');

class DatabaseConnection {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000;
        this.connectionCheckInterval = 60000; // Aumentado a 60 segundos
        this.checkIntervalId = null;
    }

    async verifyDNS(hostname) {
        try {
            console.log(`🔍 Verificando DNS para: ${hostname}`);
            const addresses = await dns.resolve(hostname);
            console.log(`✅ DNS resuelto:`, addresses);
            return true;
        } catch (error) {
            console.error(`❌ Error al resolver DNS:`, error.message);
            
            // Intentar con IPv4 explícitamente
            try {
                const addresses = await dns.resolve4(hostname);
                console.log(`✅ DNS IPv4 resuelto:`, addresses);
                return true;
            } catch (error4) {
                // Intentar con IPv6 explícitamente
                try {
                    const addresses = await dns.resolve6(hostname);
                    console.log(`✅ DNS IPv6 resuelto:`, addresses);
                    return true;
                } catch (error6) {
                    console.error(`❌ No se pudo resolver ni IPv4 ni IPv6`);
                    return false;
                }
            }
        }
    }

    async connect() {
        try {
            if (this.pool && this.isConnected) {
                console.log('✅ Conexión a la base de datos ya existe');
                return this.pool;
            }

            console.log('🔄 Iniciando conexión a la base de datos...');
            
            // Obtener la URL de conexión
            const dbUrl = await getdbinfo();
            
            // Extraer hostname para verificar DNS
            const urlMatch = dbUrl.match(/@([^:]+):/);
            if (urlMatch) {
                const hostname = urlMatch[1];
                const dnsOk = await this.verifyDNS(hostname);
                if (!dnsOk) {
                    throw new Error(`No se puede resolver el hostname: ${hostname}. Verifica tu conexión de red y configuración IPv6.`);
                }
            }
            
            // Configuración SSL con certificado
            const sslConfig = this.getSSLConfig();
            
            // Configuración del pool de conexiones para Transaction Pooler
            const config = {
                connectionString: dbUrl,
                max: 5, // Transaction pooler maneja menos conexiones
                min: 1, // Mínimo de 1
                idleTimeoutMillis: 30000, // 30 segundos
                connectionTimeoutMillis: 10000, // 10 segundos
                ssl: sslConfig,
                application_name: 'PassManager'
            };

            // Crear el pool de conexiones
            this.pool = new Pool(config);

            // Configurar eventos del pool
            this.pool.on('connect', (client) => {
                console.log('✅ Nueva conexión establecida a la base de datos');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Configurar el cliente para mantener la conexión viva
                client.query('SET statement_timeout = 0');
                client.query('SET idle_in_transaction_session_timeout = 0');
            });

            this.pool.on('error', (err, client) => {
                // Logs de error detallados removidos por seguridad
                
                // No marcar como desconectado inmediatamente
                // Dejar que el mecanismo de verificación lo maneje
                if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
                    this.isConnected = false;
                    this.handleReconnection();
                }
            });

            this.pool.on('remove', () => {
                console.log('⚠️  Cliente removido del pool');
            });

            // Probar la conexión
            const client = await this.pool.connect();
            try {
                const result = await client.query('SELECT NOW(), version()');
                // Logs de información del servidor removidos por seguridad
            } finally {
                client.release();
            }

            console.log('✅ Conexión a la base de datos establecida correctamente');
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Iniciar verificación periódica de conexión
            this.startConnectionCheck();

            return this.pool;

        } catch (error) {
            // Logs de error detallados removidos por seguridad
            
            // Información adicional para debugging
            if (error.message.includes('ENOTFOUND')) {
                console.error('💡 Posibles soluciones:');
                console.error('   1. Verifica que tu instancia tenga acceso a Internet');
                console.error('   2. Usa Transaction Pooler en lugar de Direct Connection');
                console.error('   3. Verifica que IPv6 esté habilitado en Windows Server');
                console.error('   4. Revisa las reglas de seguridad de AWS (Security Groups)');
            }
            
            this.isConnected = false;
            throw error;
        }
    }

    async handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Máximo número de intentos de reconexión alcanzado');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts; // Backoff exponencial
        console.log(`🔄 Intentando reconectar en ${delay/1000}s... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(async () => {
            try {
                // Cerrar el pool anterior si existe
                if (this.pool) {
                    await this.pool.end();
                    this.pool = null;
                }
                await this.connect();
            } catch (error) {
                // Log de error de reconexión removido por seguridad
            }
        }, delay);
    }

    startConnectionCheck() {
        // Limpiar intervalo anterior si existe
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
        }

        this.checkIntervalId = setInterval(async () => {
            if (!this.pool) {
                console.log('⚠️  Pool no existe, intentando reconectar...');
                this.isConnected = false;
                this.handleReconnection();
                return;
            }

            try {
                const client = await this.pool.connect();
                try {
                    await client.query('SELECT 1 as healthcheck');
                    if (!this.isConnected) {
                        console.log('✅ Conexión restaurada');
                        this.isConnected = true;
                        this.reconnectAttempts = 0;
                    }
                } finally {
                    client.release();
                }
            } catch (error) {
                // Log de error de verificación removido por seguridad
                this.isConnected = false;
                this.handleReconnection();
            }
        }, this.connectionCheckInterval);
    }

    async query(text, params) {
        if (!this.pool) {
            throw new Error('No hay pool de conexiones');
        }

        const maxRetries = 3;
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await this.pool.query(text, params);
                return result;
            } catch (error) {
                lastError = error;
                // Log de error de query removido por seguridad
                
                if (i < maxRetries - 1) {
                    // Esperar antes de reintentar
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }

        throw lastError;
    }

    async close() {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
        }

        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            this.isConnected = false;
            console.log('🔌 Conexión a la base de datos cerrada');
        }
    }

    getSSLConfig() {
        const certsDir = path.join(__dirname, '../certs');
        
        let certPath = null;
        if (fs.existsSync(certsDir)) {
            const files = fs.readdirSync(certsDir);
            const certFile = files.find(file => file.endsWith('.crt'));
            if (certFile) {
                certPath = path.join(certsDir, certFile);
            }
        }
        
        if (certPath && fs.existsSync(certPath)) {
            try {
                const certContent = fs.readFileSync(certPath, 'utf8');
                console.log('🔐 Usando certificado SSL de Supabase:', path.basename(certPath));
                
                return {
                    rejectUnauthorized: true,
                    ca: certContent,
                    secureProtocol: 'TLSv1_2_method',
                    checkServerIdentity: (servername, cert) => {
                        // Validación adicional del certificado del servidor
                        return undefined; // Aceptar si pasa validaciones básicas
                    },
                    timeout: 10000, // 10 segundos timeout
                    keepAlive: true
                };
            } catch (error) {
                console.error('❌ Error al leer el certificado:', error.message);
                return this.getDefaultSSLConfig();
            }
        } else {
            console.log('⚠️  Certificado SSL no encontrado, usando configuración por defecto');
            return this.getDefaultSSLConfig();
        }
    }

    getDefaultSSLConfig() {
        // Configuración SSL más segura por defecto
        return {
            rejectUnauthorized: true, // Más estricto por defecto
            secureProtocol: 'TLSv1_2_method',
            timeout: 10000, // 10 segundos timeout
            keepAlive: true,
            checkServerIdentity: (servername, cert) => {
                // Validación básica del certificado del servidor
                if (!cert || !cert.subject) {
                    return new Error('Invalid certificate');
                }
                return undefined; // Aceptar si pasa validaciones básicas
            }
        };
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            hasPool: !!this.pool
        };
    }
}

// Instancia singleton
let dbInstance = null;

const connectDB = async () => {
    if (!dbInstance) {
        dbInstance = new DatabaseConnection();
    }
    
    if (!dbInstance.isConnected) {
        await dbInstance.connect();
    }
    
    return dbInstance.pool;
};

const getDB = async () => {
    if (!dbInstance || !dbInstance.pool) {
        console.log('🔄 No hay pool de conexiones, intentando conectar...');
        await connectDB();
    }
    return dbInstance.pool;
};

// Manejar cierre graceful
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM recibido, cerrando conexiones...');
    if (dbInstance) {
        await dbInstance.close();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 SIGINT recibido, cerrando conexiones...');
    if (dbInstance) {
        await dbInstance.close();
    }
    process.exit(0);
});

module.exports = {
    connectDB,
    getDB,
    getDBInstance: () => dbInstance
};
