const WebhooksManager = require('../utils/WebhooksManager');

const VerifyStripeEvent = async (req, res, next) => {
    // Stripe envía la firma en el header 'stripe-signature'
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
        console.warn('⚠️ Webhook sin firma de Stripe');
        return res.status(403).json({ 
            error: 'Missing stripe-signature header',
            message: 'El webhook debe incluir el header stripe-signature'
        });
    }

    // El payload viene como Buffer desde express.raw()
    const payload = req.body;
    
    if (!payload || payload.length === 0) {
        console.warn('⚠️ Webhook sin payload');
        return res.status(400).json({ 
            error: 'Empty payload',
            message: 'El webhook debe incluir un payload'
        });
    }

    const result = await WebhooksManager.createEvent(signature, payload);
    
    if (result.error) {
        console.error('❌ Error verificando webhook:', result.error);
        return res.status(403).json({ 
            error: result.error,
            message: 'No se pudo verificar la firma del webhook'
        });
    }
    
    if (!result.success) {
        console.error('❌ Webhook no verificado:', result.message);
        return res.status(403).json({ 
            error: result.message || 'Webhook verification failed'
        });
    }
    
    console.log('✅ Webhook verificado exitosamente:', result.event.id);
    req.event = result.event;
    next();
}

module.exports = VerifyStripeEvent;