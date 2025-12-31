const WebhooksRouter = async (req, res) => {
    const event = req.event;

    console.log('WebhooksRouter: event received:\n', event);
    // IMPORTANTE: Stripe espera una respuesta 200 dentro de 20 segundos
    // Retornamos inmediatamente y procesamos el evento de forma asíncrona
    res.status(200).json({ received: true });
    
    // Procesar el evento de forma asíncrona
    try {
        console.log(`📥 Webhook recibido - Tipo: ${event.type}, ID: ${event.id}`);
        
        // Manejar solo los tipos de eventos necesarios
        switch (event.type) {
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
        console.error('Evento:', event);
    }
    
    return;
}

module.exports = WebhooksRouter;