const express = require('express');
const router = express.Router();

//middlewares
const AccountIsAClient = require('../middlewares/AccountIsAClient');
const CustomerIsAvailable = require('../middlewares/CustomerIsAvailable');
const CustomerExistByID = require('../middlewares/CustomerExistByID');

//handlers
const CreateStripeCustomer = require('../handlers/CreateStripeCustomer');
const CreatePortalSession = require('../handlers/CreatePortalSession');
//const GetStatus = require('../handlers/GetStatus');

// Las rutas aquí se montan en /api desde server.js
// Express automáticamente remueve el prefijo /api antes de pasarlo al router
router.get('/health', (req, res) => {
    console.log('Health check: OK, time: ', new Date().toISOString());
    return res.json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

router.post("/customer", AccountIsAClient, CustomerIsAvailable, CreateStripeCustomer);
router.get("/portal", AccountIsAClient, CustomerExistByID, CreatePortalSession);
//router.get("/status", AccountIsAClient, CustomerExistByID, GetStatus);


  // Middleware para manejar rutas no encontradas
router.use((req, res) => {
    return res.status(404).json({
      error: 'Ruta no encontrada',
      path: req.originalUrl,
      method: req.method
    });
  });

module.exports = router;