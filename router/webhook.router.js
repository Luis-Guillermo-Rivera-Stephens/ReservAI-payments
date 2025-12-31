const express = require('express');
const router = express.Router();

//middlewares
// VerifyStripeEvent ya se aplica en server.js antes de llegar aquí

//handlers
const WebhooksRouter = require('../handlers/WebhooksRouter');

// La ruta /webhooks ya está definida en server.js, aquí solo definimos /stripe
router.post('/stripe', WebhooksRouter);

module.exports = router;