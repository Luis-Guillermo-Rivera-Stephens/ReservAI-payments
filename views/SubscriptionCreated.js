class SubscriptionCreatedMessage {
    static getMessage(name, subscriptionData) {
        const { plan_name, amount, current_period_end } = subscriptionData;
        const formattedAmount = `$${(amount / 100).toFixed(2)}`;
        const endDate = new Date(current_period_end * 1000).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return {
            subject: `¡Bienvenido a ReservAI! - Tu suscripción está activa`,
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">¡Hola ${name}!</h2>
                    <p>Nos complace informarte que tu suscripción a <strong>ReservAI</strong> ha sido activada exitosamente.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Detalles de tu suscripción:</h3>
                        <p><strong>Plan:</strong> ${plan_name || 'Plan Premium'}</p>
                        <p><strong>Monto:</strong> ${formattedAmount}</p>
                        <p><strong>Próxima renovación:</strong> ${endDate}</p>
                        <p><strong>Estado:</strong> <span style="color: #4CAF50;">Activa</span></p>
                    </div>
                    
                    <p>Ya puedes comenzar a disfrutar de todos los beneficios de tu suscripción.</p>
                    
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    
                    <p style="margin-top: 30px;">Saludos,<br>El equipo de ReservAI</p>
                </div>
            `,
            text_content: `
¡Hola ${name}!

Nos complace informarte que tu suscripción a ReservAI ha sido activada exitosamente.

Detalles de tu suscripción:
- Plan: ${plan_name || 'Plan Premium'}
- Monto: ${formattedAmount}
- Próxima renovación: ${endDate}
- Estado: Activa

Ya puedes comenzar a disfrutar de todos los beneficios de tu suscripción.

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
El equipo de ReservAI
            `
        }
    }
}

module.exports = SubscriptionCreatedMessage;

