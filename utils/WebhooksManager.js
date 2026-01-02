const getStripeInstance = require('../data/StripeInstanceGetter');

class WebhooksManager {
    static async createEvent(signature, payload, stripe) {
        try {
            // El payload debe ser un Buffer (express.raw() lo proporciona así)
            // Stripe espera el payload como Buffer o string
            const event = stripe.webhooks.constructEvent(
                payload, 
                signature, 
                process.env.STRIPE_WEBHOOK_SECRET
            );
            return {
                success: true,
                message: 'Event created successfully',
                event: event
            }
        } catch (error) {
            console.error('❌ Error verificando webhook de Stripe:', error.message);
            return {
                success: false,
                error: error.message
            }
        }
    }
}

module.exports = WebhooksManager;