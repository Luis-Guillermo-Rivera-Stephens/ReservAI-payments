class SubscriptionCancelledMessage {
    static getMessage(name, subscriptionData) {
        const { plan_name, current_period_end } = subscriptionData;
        const endDate = current_period_end 
            ? new Date(current_period_end * 1000).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'Inmediato';

        return {
            subject: `Tu suscripción ha sido cancelada - ReservAI`,
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #F44336;">Hola ${name}</h2>
                    <p>Te informamos que tu suscripción a <strong>ReservAI</strong> ha sido cancelada.</p>
                    
                    <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F44336;">
                        <h3 style="margin-top: 0; color: #333;">Detalles de la cancelación:</h3>
                        <p><strong>Plan:</strong> ${plan_name || 'Plan Premium'}</p>
                        <p><strong>Acceso hasta:</strong> ${endDate}</p>
                        <p><strong>Estado:</strong> <span style="color: #F44336;">Cancelada</span></p>
                    </div>
                    
                    <p>Tu acceso a los servicios de ReservAI permanecerá activo hasta el final del período de facturación actual (${endDate}).</p>
                    
                    <p>Si cancelaste por error o deseas reactivar tu suscripción, puedes hacerlo desde tu panel de control o contactándonos directamente.</p>
                    
                    <p>Lamentamos verte partir. Si hay algo en lo que podamos ayudarte, no dudes en contactarnos.</p>
                    
                    <p style="margin-top: 30px;">Saludos,<br>El equipo de ReservAI</p>
                </div>
            `,
            text_content: `
Hola ${name}

Te informamos que tu suscripción a ReservAI ha sido cancelada.

Detalles de la cancelación:
- Plan: ${plan_name || 'Plan Premium'}
- Acceso hasta: ${endDate}
- Estado: Cancelada

Tu acceso a los servicios de ReservAI permanecerá activo hasta el final del período de facturación actual (${endDate}).

Si cancelaste por error o deseas reactivar tu suscripción, puedes hacerlo desde tu panel de control o contactándonos directamente.

Lamentamos verte partir. Si hay algo en lo que podamos ayudarte, no dudes en contactarnos.

Saludos,
El equipo de ReservAI
            `
        }
    }
}

module.exports = SubscriptionCancelledMessage;

