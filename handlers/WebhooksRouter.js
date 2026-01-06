const CustomerInfo = require('../models/customerInfo');
const Subscription = require('../models/subscription');
const PaymentHistory = require('../models/paymentHistory');
const { connectDB } = require('../data/connectDB');
const CustomersManager = require('../utils/CustomersManager');
const SubscriptionManager = require('../utils/SubscriptionManager');
const PaymentHistoryManager = require('../utils/PaymentHistoryManager');
const EmailContentManager = require('../utils/EmailContentManager');
const EmailManager = require('../utils/EmailManager');



const WebhooksRouter = async (req, res) => {
    const event = req.event;
    res.status(200).json({ received: true });
    let db = null;
    let eventData = null; // Variable para almacenar la instancia creada (Subscription o PaymentHistory)
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
                    eventData = subscription; // Guardar la instancia para el email
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
                        eventData = subscription; // Guardar la instancia para el email
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
                    const subscription = Subscription.fromStripeObject(event.data.object);
                    eventData = subscription; // Guardar la instancia para el email
                    const subscriptionId = subscription.stripe_subscription_id;
                    const customerId = subscription.stripe_customer_id;
                    
                    const result = await SubscriptionManager.updateSubscriptionOnCancellation(
                        customerId,
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
                    eventData = invoice; // Guardar el invoice original para el email (tiene todos los campos que necesitan los views)
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
                    eventData = invoice; // Guardar el invoice original para el email (tiene todos los campos que necesitan los views)
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
    
    // Enviar email al cliente (excepto para customer.created)
    try {
        // Early return si es customer.created
        if (event.type === 'customer.created') {
            return;
        }
        
        const eventObject = event.data.object;
        
        // Early return si no hay customer
        if (!eventObject.customer) {
            return;
        }
        
        // Obtener customer_id (puede ser string o objeto expandido)
        const customerId = typeof eventObject.customer === 'string' 
            ? eventObject.customer 
            : eventObject.customer.id || eventObject.customer;
        
        // Early return si no hay customerId
        if (!customerId) {
            return;
        }
        
        // Obtener email y nombre del cliente
        const customerInfo = await CustomersManager.getCustomersEmailAndName(customerId, db);
        if (!customerInfo.success) {
            console.error('❌ Error obteniendo email y nombre del cliente:', customerInfo.error);
            return;
        }
        
        // Early return si no hay eventData
        if (!eventData) {
            return;
        }
        
        // Convertir eventData al formato que esperan los views
        let emailData = null;
        if (eventData instanceof Subscription) {
            // Para subscriptions, convertir a formato que esperan los views
            const subscriptionJSON = eventData.toJSON();
            emailData = {
                plan_name: subscriptionJSON.plan_name,
                amount: subscriptionJSON.amount * 100, // Convertir de dólares a centavos (los views esperan centavos)
                current_period_start: subscriptionJSON.current_period_start instanceof Date 
                    ? Math.floor(subscriptionJSON.current_period_start.getTime() / 1000) 
                    : subscriptionJSON.current_period_start,
                current_period_end: subscriptionJSON.current_period_end instanceof Date 
                    ? Math.floor(subscriptionJSON.current_period_end.getTime() / 1000) 
                    : subscriptionJSON.current_period_end,
                status: subscriptionJSON.status
            };
        } else {
            // Para invoices, eventData ya es el objeto invoice original de Stripe
            emailData = eventData;
        }
        
        // Obtener el contenido del email
        const emailContent = await EmailContentManager.getEmailContent(
            customerInfo.name,
            event.type,
            emailData
        );
        
        // Early return si no hay contenido de email
        if (!emailContent) {
            console.log('ℹ️ No hay contenido de email para el evento:', event.type);
            return;
        }
        
        // Enviar el email
        const emailResult = await EmailManager.sendEmailToCustomer(
            customerInfo.email,
            emailContent.subject,
            emailContent.content,
            emailContent.text_content
        );
        
        if (!emailResult.success) {
            console.error('❌ Error enviando email:', emailResult.error);
            return;
        }
        
        console.log('✅ Email enviado exitosamente a:', customerInfo.email);
    } catch (error) {
        console.error('❌ Error en el proceso de envío de email:', error.message);
    }
    
    return;
}

module.exports = WebhooksRouter;