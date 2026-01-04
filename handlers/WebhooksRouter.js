const CustomerInfo = require('../models/customerInfo');
const Subscription = require('../models/subscription');
const { connectDB } = require('../data/connectDB');
const CustomersManager = require('../utils/CustomersManager');
const SubscriptionManager = require('../utils/SubscriptionManager');


const WebhooksRouter = async (req, res) => {
    const event = req.event;
    res.status(200).json({ received: true });
    let db = null;
    try {
        db = await connectDB();
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
        return;
    }
    // Procesar el evento de forma asíncrona
    try {

        // Manejar solo los tipos de eventos necesarios
        switch (event.type) {

            case 'customer.created':
                console.log('✅ Customer created:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                const customer = CustomerInfo.fromStripeObject(event.data.object);
                const result = await CustomersManager.createCustomerInDB(customer.account_id, customer.stripe_customer_id, db);
                if (result.error) {
                    console.error('❌ Error creando customer en DB:', result.error);
                    return;
                }
                console.log('✅ Customer created in DB');
                break;

            case 'customer.subscription.created':
                console.log('✅ Suscripción creada:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                try {
                    const subscription = Subscription.fromStripeObject(event.data.object);
                    console.log('✅ Suscripción creada en Stripe:', subscription);
                    const result = await SubscriptionManager.createSubscriptionInDB(subscription, db);
                    if (!result.success) {
                        console.error('❌ Error creando suscripción en DB:', result.error);
                        return;
                    }
                    console.log('✅ Suscripción creada en DB:', subscription.stripe_subscription_id);
                } catch (error) {
                    console.error('❌ Error procesando suscripción creada:', error.message);
                }
                break;
                
            case 'customer.subscription.updated':
                console.log('🔄 Suscripción actualizada:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                // Aquí puedes agregar lógica para cuando se actualiza una suscripción
                break;
                
            case 'customer.subscription.deleted':
                console.log('🗑️ Suscripción eliminada:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                // Aquí puedes agregar lógica para cuando se elimina una suscripción
                break;
                
            case 'invoice.payment_succeeded':
                console.log('💳 Pago de factura exitoso:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                const invoice = event.data.object;
                
                // Si es el pago inicial de una suscripción, actualizar el estado
                if (invoice.billing_reason === 'subscription_create' && invoice.subscription) {
                    try {
                        const subscriptionId = invoice.subscription;
                        const customerId = invoice.customer;
                        const periodStart = invoice.period_start ? new Date(invoice.period_start * 1000) : null;
                        const periodEnd = invoice.period_end ? new Date(invoice.period_end * 1000) : null;
                        
                        if (periodStart && periodEnd) {
                            const result = await SubscriptionManager.updateSubscriptionOnPaymentSuccess(
                                customerId,
                                subscriptionId,
                                periodStart,
                                periodEnd,
                                db
                            );
                            if (!result.success) {
                                console.error('❌ Error actualizando suscripción en pago exitoso:', result.error);
                            } else {
                                console.log('✅ Suscripción actualizada a activa:', subscriptionId);
                            }
                        }
                    } catch (error) {
                        console.error('❌ Error procesando pago exitoso de suscripción:', error.message);
                    }
                }
                break;
                
            case 'invoice.payment_failed':
                console.log('❌ Pago de factura fallido:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                // Aquí puedes agregar lógica para facturas con pago fallido
                break;
                
            default:
                // Evento no manejado - no imprimir nada
                break;
        }
        
    } catch (error) {
        console.error('❌ Error procesando webhook:', error.message);
    }
    
    return;
}

module.exports = WebhooksRouter;