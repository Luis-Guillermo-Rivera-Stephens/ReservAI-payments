const CustomerInfo = require('../models/customerInfo');
const Subscription = require('../models/subscription');
const PaymentHistory = require('../models/paymentHistory');
const { connectDB } = require('../data/connectDB');
const CustomersManager = require('../utils/CustomersManager');
const SubscriptionManager = require('../utils/SubscriptionManager');
const PaymentHistoryManager = require('../utils/PaymentHistoryManager');


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
                try {
                    const stripeSubscription = event.data.object;
                    const previousAttributes = event.data.previous_attributes || {};
                    let shouldUpdate = false;
                    
                    // Caso 1: Se solicita cancelación (cancellation_details.reason === 'cancellation_requested')
                    if (stripeSubscription.cancellation_details?.reason === 'cancellation_requested') {
                        stripeSubscription.cancel_at_period_end = true;
                        console.log('⚠️ Cancellation requested detectada, cancel_at_period_end será true');
                        shouldUpdate = true;
                    }
                    // Caso 2: Se cancela la cancelación (reactivación)
                    // cancel_at_period_end es false Y cancellation_details.reason es null Y antes había cancellation_requested
                    else if (
                        stripeSubscription.cancel_at_period_end === false &&
                        (!stripeSubscription.cancellation_details?.reason || stripeSubscription.cancellation_details.reason === null) &&
                        previousAttributes.cancellation_details?.reason === 'cancellation_requested'
                    ) {
                        stripeSubscription.cancel_at_period_end = false;
                        console.log('✅ Cancelación de cancelación detectada (reactivación), cancel_at_period_end será false');
                        shouldUpdate = true;
                    }
                    
                    if (shouldUpdate) {
                        const subscription = Subscription.fromStripeObject(stripeSubscription);
                        console.log('✅ Suscripción actualizada en Stripe:', subscription);
                        const result = await SubscriptionManager.updateSubscriptionInDB(subscription, db);
                        if (!result.success) {
                            console.error('❌ Error actualizando suscripción en DB:', result.error);
                        } else {
                            console.log('✅ Suscripción actualizada en DB:', subscription.stripe_subscription_id);
                        }
                    } else {
                        console.log('ℹ️ No hay cambios de cancelación, no se actualiza en DB');
                    }
                } catch (error) {
                    console.error('❌ Error procesando suscripción actualizada:', error.message);
                }
                break;
                
            case 'customer.subscription.deleted':
                console.log('🗑️ Suscripción eliminada:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                try {
                    const subscription = event.data.object;
                    const subscriptionId = subscription.id;
                    const customerId = subscription.customer;
                    
                    // Manejar customer que puede ser un string o un objeto expandido
                    const stripeCustomerId = typeof customerId === 'string' 
                        ? customerId 
                        : customerId.id || customerId;
                    
                    const result = await SubscriptionManager.updateSubscriptionOnCancellation(
                        stripeCustomerId,
                        subscriptionId,
                        db
                    );
                    if (!result.success) {
                        console.error('❌ Error actualizando suscripción cancelada en DB:', result.error);
                    } else {
                        console.log('✅ Suscripción cancelada en DB:', subscriptionId);
                    }
                } catch (error) {
                    console.error('❌ Error procesando suscripción eliminada:', error.message);
                }
                break;
                
            case 'invoice.payment_succeeded':
                console.log('💳 Pago de factura exitoso:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                try {
                    const invoice = event.data.object;
                    
                    // Si el invoice tiene una suscripción asociada, actualizar los períodos
                    if (invoice.subscription) {
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
                                console.log('✅ Suscripción actualizada con nuevos períodos:', subscriptionId);
                            }
                        }
                    }
                    
                    // Agregar el invoice al payment_history
                    const paymentHistory = PaymentHistory.fromStripeInvoice(invoice);
                    console.log('📝 PaymentHistory creado:', JSON.stringify(paymentHistory.toJSON(), null, 2));
                    const paymentResult = await PaymentHistoryManager.createPaymentHistoryInDB(paymentHistory, db);
                    if (!paymentResult.success) {
                        console.error('❌ Error creando registro en payment_history:', paymentResult.error);
                    } else {
                        console.log('✅ Registro agregado a payment_history:', invoice.id);
                    }
                } catch (error) {
                    console.error('❌ Error procesando pago exitoso de invoice:', error.message);
                }
                break;
                
            case 'invoice.payment_failed':
                console.log('❌ Pago de factura fallido:', event.data.object.id);
                console.log('Event data:', JSON.stringify(event.data, null, 2));
                try {
                    const invoice = event.data.object;
                    
                    // Si el invoice tiene una suscripción asociada, actualizar el estado
                    if (invoice.subscription) {
                        const subscriptionId = invoice.subscription;
                        const customerId = invoice.customer;
                        
                        const result = await SubscriptionManager.updateSubscriptionOnPaymentFailed(
                            customerId,
                            subscriptionId,
                            'unpaid',
                            db
                        );
                        if (!result.success) {
                            console.error('❌ Error actualizando suscripción en pago fallido:', result.error);
                        } else {
                            console.log('✅ Suscripción actualizada a unpaid:', subscriptionId);
                        }
                    }
                    
                    // Agregar el invoice al payment_history
                    const paymentHistory = PaymentHistory.fromStripeInvoice(invoice);
                    console.log('📝 PaymentHistory creado:', JSON.stringify(paymentHistory.toJSON(), null, 2));
                    const paymentResult = await PaymentHistoryManager.createPaymentHistoryInDB(paymentHistory, db);
                    if (!paymentResult.success) {
                        console.error('❌ Error creando registro en payment_history:', paymentResult.error);
                    } else {
                        console.log('✅ Registro agregado a payment_history:', invoice.id);
                    }
                } catch (error) {
                    console.error('❌ Error procesando pago fallido de invoice:', error.message);
                }
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