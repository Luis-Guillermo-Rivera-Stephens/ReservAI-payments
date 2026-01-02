const CustomerInfo = require('../models/customerInfo');
const { connectDB } = require('../data/connectDB');
const CustomersManager = require('../utils/CustomersManager');


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
                // Aquí puedes agregar lógica para cuando se crea una suscripción
                break;
                
            case 'customer.subscription.updated':
                console.log('🔄 Suscripción actualizada:', event.data.object.id);
                // Aquí puedes agregar lógica para cuando se actualiza una suscripción
                break;
                
            case 'customer.subscription.deleted':
                console.log('🗑️ Suscripción eliminada:', event.data.object.id);
                // Aquí puedes agregar lógica para cuando se elimina una suscripción
                break;
                
            case 'invoice.payment_succeeded':
                console.log('💳 Pago de factura exitoso:', event.data.object.id);
                // Aquí puedes agregar lógica para facturas pagadas exitosamente
                break;
                
            case 'invoice.payment_failed':
                console.log('❌ Pago de factura fallido:', event.data.object.id);
                // Aquí puedes agregar lógica para facturas con pago fallido
                break;
                
            default:
                console.log(`ℹ️ Evento no manejado: ${event.type}`);
        }
        
        // Aquí puedes agregar lógica adicional según tus necesidades
        // Por ejemplo: actualizar base de datos, enviar emails, etc.
        
    } catch (error) {
        // IMPORTANTE: Los errores aquí no afectan la respuesta a Stripe
        // ya que ya retornamos 200. Solo los logueamos.
        console.error('❌ Error procesando webhook:', error.message);
    }
    
    return;
}

module.exports = WebhooksRouter;