const express = require('express');
const router = express.Router();

//middlewares
const AccountIsAClient = require('../middlewares/AccountIsAClient');
const CustomerIsAvailable = require('../middlewares/CustomerIsAvailable');
const CustomerExistByID = require('../middlewares/CustomerExistByID');
const AccountExistByID = require('../middlewares/AccountExistByID');
const VerifyToken = require('../middlewares/VerifyToken');
const AccessTokenType = require('../middlewares/AccessTokenType');
const PathSecurityValidator = require('../middlewares/PathSecurityValidator');

//handlers
const CreateStripeCustomer = require('../handlers/CreateStripeCustomer');
const CreatePortalSession = require('../handlers/CreatePortalSession');
const GetMyPaymentLinks = require('../handlers/GetMyPaymentLinks');
const GetMySubscriptions = require('../handlers/GetMySubscriptions');

// Las rutas aquí se montan en /api desde server.js
// Express automáticamente remueve el prefijo /api antes de pasarlo al router

// Protección de archivos sensibles - debe ir antes de todas las rutas
router.use(PathSecurityValidator.middleware());

router.get('/health', (req, res) => {
    console.log('Health check: OK, time: ', new Date().toISOString());
    return res.status(200).json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

const withAccess = [VerifyToken, AccessTokenType, AccountExistByID, AccountIsAClient];

router.post("/customer", ...withAccess, CustomerIsAvailable, CreateStripeCustomer);
router.get("/portal", ...withAccess, CustomerExistByID, CreatePortalSession);
router.get("/links", ...withAccess, CustomerExistByID, GetMyPaymentLinks);
router.get("/status", ...withAccess, CustomerExistByID, GetMySubscriptions);


  // Middleware para manejar rutas no encontradas
router.use((req, res) => {
    return res.status(404).json({
      error: 'Ruta no encontrada',
      path: req.originalUrl,
      method: req.method
    });
  });

module.exports = router;