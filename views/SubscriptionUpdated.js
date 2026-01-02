class SubscriptionUpdatedMessage {
    static getMessage(name, subscriptionData) {
        const { plan_name, amount, current_period_start, current_period_end, status } = subscriptionData;
        const formattedAmount = `$${(amount / 100).toFixed(2)}`;
        const startDate = new Date(current_period_start * 1000).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const endDate = new Date(current_period_end * 1000).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const statusMessages = {
            'active': { text: 'Activa', color: '#4CAF50' },
            'past_due': { text: 'Pago pendiente', color: '#FF9800' },
            'canceled': { text: 'Cancelada', color: '#F44336' },
            'unpaid': { text: 'Sin pagar', color: '#F44336' }
        };

        const statusInfo = statusMessages[status] || { text: status, color: '#757575' };

        return {
            subject: `Actualización de tu suscripción - ReservAI`,
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2196F3;">Hola ${name}</h2>
                    <p>Tu suscripción a <strong>ReservAI</strong> ha sido actualizada.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Detalles actualizados:</h3>
                        <p><strong>Plan:</strong> ${plan_name || 'Plan Premium'}</p>
                        <p><strong>Monto:</strong> ${formattedAmount}</p>
                        <p><strong>Período actual:</strong> ${startDate} - ${endDate}</p>
                        <p><strong>Estado:</strong> <span style="color: ${statusInfo.color};">${statusInfo.text}</span></p>
                    </div>
                    
                    <p>Si tienes alguna pregunta sobre estos cambios, no dudes en contactarnos.</p>
                    
                    <p style="margin-top: 30px;">Saludos,<br>El equipo de ReservAI</p>
                </div>
            `,
            text_content: `
Hola ${name}

Tu suscripción a ReservAI ha sido actualizada.

Detalles actualizados:
- Plan: ${plan_name || 'Plan Premium'}
- Monto: ${formattedAmount}
- Período actual: ${startDate} - ${endDate}
- Estado: ${statusInfo.text}

Si tienes alguna pregunta sobre estos cambios, no dudes en contactarnos.

Saludos,
El equipo de ReservAI
            `
        }
    }
}

module.exports = SubscriptionUpdatedMessage;

