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
        return;
    }
    // Procesar el evento de forma asíncrona
    try {
        
        // Manejar solo los tipos de eventos necesarios
        switch (event.type) {

            case 'customer.created':
                const customer = CustomerInfo.fromStripeObject(event.data.object);
                const result = await CustomersManager.createCustomerInDB(customer.account_id, customer.stripe_customer_id, db);
                if (result.error) {
                    return;
                }
                break;

            case 'customer.subscription.created':
                try {
                    const subscription = Subscription.fromStripeObject(event.data.object);
                    eventData = subscription; // Guardar la instancia para el email
                    const result = await SubscriptionManager.createSubscriptionInDB(subscription, db);
                    if (!result.success) {
                        return;
                    }
                } catch (error) {
                    // Error procesando suscripción creada
                }
                break;
                
            case 'customer.subscription.updated':
                try {
                    const stripeSubscription = event.data.object;
                    const previousAttributes = event.data.previous_attributes || {};
                    let shouldUpdate = false;
                    
                    // Caso 1: Se solicita cancelación (cancellation_details.reason === 'cancellation_requested')
                    if (stripeSubscription.cancellation_details?.reason === 'cancellation_requested') {
                        stripeSubscription.cancel_at_period_end = true;
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
                        shouldUpdate = true;
                    }
                    
                    if (shouldUpdate) {
                        const subscription = Subscription.fromStripeObject(stripeSubscription);
                        eventData = subscription; // Guardar la instancia para el email
                        const result = await SubscriptionManager.updateSubscriptionInDB(subscription, db);
                        if (!result.success) {
                            // Error actualizando suscripción en DB
                        }
                    }
                } catch (error) {
                    // Error procesando suscripción actualizada
                }
                break;
                
            case 'customer.subscription.deleted':
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
                        // Error actualizando suscripción cancelada en DB
                    }
                } catch (error) {
                    // Error procesando suscripción eliminada
                }
                break;
                
            case 'invoice.payment_succeeded':
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
                                // Error actualizando suscripción en pago exitoso
                            }
                        }
                    }
                    
                    // Agregar el invoice al payment_history
                    const paymentHistory = PaymentHistory.fromStripeInvoice(invoice);
                    eventData = invoice; // Guardar el invoice original para el email (tiene todos los campos que necesitan los views)
                    const paymentResult = await PaymentHistoryManager.createPaymentHistoryInDB(paymentHistory, db);
                    if (!paymentResult.success) {
                        // Error creando registro en payment_history
                    }
                } catch (error) {
                    // Error procesando pago exitoso de invoice
                }
                break;
                
            case 'invoice.payment_failed':
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
                            // Error actualizando suscripción en pago fallido
                        }
                    }
                    
                    // Agregar el invoice al payment_history
                    const paymentHistory = PaymentHistory.fromStripeInvoice(invoice);
                    eventData = invoice; // Guardar el invoice original para el email (tiene todos los campos que necesitan los views)
                    const paymentResult = await PaymentHistoryManager.createPaymentHistoryInDB(paymentHistory, db);
                    if (!paymentResult.success) {
                        // Error creando registro en payment_history
                    }
                } catch (error) {
                    // Error procesando pago fallido de invoice
                }
                break;
                
            default:
                // Evento no manejado - no imprimir nada
                break;
        }
        
    } catch (error) {
        // Error procesando webhook
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
            return;
        }
    } catch (error) {
        // Error en el proceso de envío de email
    }
    
    return;
}

module.exports = WebhooksRouter;