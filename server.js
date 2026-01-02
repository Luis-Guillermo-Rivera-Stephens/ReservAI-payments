// Cargar variables de entorno
require('dotenv').config();
// Configurar zona horaria para Guadalajara, Jalisco, México
const timezone = process.env.TIMEZONE || 'America/Mexico_City';
process.env.TZ = timezone;

// Configurar zona horaria en Node.js
const { DateTime } = require('luxon');

const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, getDB } = require('./data/connectDB');
const apiRouter = require('./router/api.router');
const webhookRouter = require('./router/webhook.router');
const VerifyStripeEvent = require('./middlewares/VerifyStripeEvent');
const SQLInjectionDetector = require('./middlewares/SQLInjectionDetector');


// Configuración del servidor
const app = express();
const PORT = process.argv[2] || process.env.PORT || 3000;

// Configuración del rate limiting - MÁS ESTRICTO
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 70, // máximo 70 requests por IP (reducido de 100)
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Retorna rate limit info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
  skipSuccessfulRequests: false, // Contar todas las requests
  skipFailedRequests: false, // Contar requests fallidas también
});

// Configuración de CORS - MÁS ESPECÍFICO
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Configuración de Helmet para headers de seguridad
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" }
};


// Middleware de seguridad
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.set('trust proxy', 1);

// Aplicar rate limiting a todas las rutas
app.use(limiter);

// Inicializar servidor y base de datos
const startServer = async () => {
  try {
    // Conectar a la base de datos
    console.log('🔄 Iniciando conexión a la base de datos...');
    await connectDB();
    console.log('✅ Base de datos conectada exitosamente');

    app.use("/webhooks", express.raw({type: 'application/json'}), VerifyStripeEvent, webhookRouter);
    
    app.use('/api', express.json({ limit: '10mb' }), express.urlencoded({ extended: true, limit: '10mb' }), SQLInjectionDetector.middleware(), apiRouter);

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      const now = new Date();
      const mexicoTime = DateTime.now().setZone(timezone);
      
      console.log(`🚀 Servidor PassManager ejecutándose en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🌐 Accesible desde: http://0.0.0.0:${PORT}`);
      console.log(`🌍 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
      console.log(`⏰ Zona horaria: ${timezone}`);
      console.log(`📅 Fecha y hora UTC: ${now.toISOString()}`);
      console.log(`🕐 Hora México (Guadalajara): ${mexicoTime.toFormat('yyyy-MM-dd HH:mm:ss')} ${mexicoTime.offsetNameShort}`);
      console.log(`📋 Rutas disponibles:`);
      console.log(`   - GET / (información del servidor)`);
      console.log(`   - GET /health (estado del servidor)`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

// Manejo graceful de cierre
process.on('SIGTERM', async () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  try {
    const db = getDB();
    await db.close();
  } catch (error) {
    console.error('Error al cerrar la base de datos:', error.message);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  try {
    const db = getDB();
    await db.close();
  } catch (error) {
    console.error('Error al cerrar la base de datos:', error.message);
  }
  process.exit(0);
});