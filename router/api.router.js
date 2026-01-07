const express = require('express');
const router = express.Router();

//middlewares
const AccountIsAClient = require('../middlewares/AccountIsAClient');
const CustomerIsAvailable = require('../middlewares/CustomerIsAvailable');
const CustomerExistByID = require('../middlewares/CustomerExistByID');
const AccountExistByID = require('../middlewares/AccountExistByID');
const VerifyToken = require('../middlewares/VerifyToken');
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
    return res.json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

router.post("/customer", VerifyToken, AccountExistByID, AccountIsAClient, CustomerIsAvailable, CreateStripeCustomer);
router.get("/portal", VerifyToken, AccountExistByID, AccountIsAClient, CustomerExistByID, CreatePortalSession);
router.get("/links", VerifyToken, AccountExistByID, AccountIsAClient, CustomerExistByID, GetMyPaymentLinks);
router.get("/status", VerifyToken, AccountExistByID, AccountIsAClient, CustomerExistByID, GetMySubscriptions);


  // Middleware para manejar rutas no encontradas
router.use((req, res) => {
    return res.status(404).json({
      error: 'Ruta no encontrada',
      path: req.originalUrl,
      method: req.method
    });
  });

module.exports = router;