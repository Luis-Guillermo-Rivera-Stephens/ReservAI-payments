class PaymentFailedMessage {
    static getMessage(name, invoiceData) {
        const { 
            amount_due, 
            invoice_pdf, 
            hosted_invoice_url,
            period_start,
            period_end,
            number,
            next_payment_attempt,
            currency = 'usd'
        } = invoiceData;
        
        const formattedAmount = `$${(amount_due / 100).toFixed(2)}`;
        const currencySymbol = currency.toUpperCase() === 'USD' ? '$' : currency.toUpperCase();
        const periodStart = period_start 
            ? new Date(period_start * 1000).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'N/A';
        const periodEnd = period_end 
            ? new Date(period_end * 1000).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'N/A';
        const nextAttempt = next_payment_attempt 
            ? new Date(next_payment_attempt * 1000).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : null;

        return {
            subject: `⚠️ Pago fallido - Acción requerida - ReservAI`,
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #F44336;">Hola ${name}</h2>
                    <p>Lamentamos informarte que no pudimos procesar el pago de tu factura.</p>
                    
                    <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F44336;">
                        <h3 style="margin-top: 0; color: #c62828;">Detalles del pago fallido:</h3>
                        <p><strong>Monto pendiente:</strong> ${currencySymbol}${(amount_due / 100).toFixed(2)}</p>
                        ${number ? `<p><strong>Número de factura:</strong> ${number}</p>` : ''}
                        ${period_start && period_end ? `
                            <p><strong>Período:</strong> ${periodStart} - ${periodEnd}</p>
                        ` : ''}
                        ${nextAttempt ? `
                            <p><strong>Próximo intento:</strong> ${nextAttempt}</p>
                        ` : ''}
                        <p><strong>Estado:</strong> <span style="color: #F44336; font-weight: bold;">Pago fallido</span></p>
                    </div>
                    
                    <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800;">
                        <h3 style="margin-top: 0; color: #e65100;">¿Qué puedes hacer?</h3>
                        <ul style="line-height: 1.8;">
                            <li><strong>Verifica tu método de pago:</strong> Asegúrate de que tu tarjeta tenga fondos suficientes y no esté vencida.</li>
                            <li><strong>Actualiza tu método de pago:</strong> Puedes actualizar tu información de pago desde tu panel de control.</li>
                            <li><strong>Contacta a tu banco:</strong> A veces los bancos bloquean transacciones por seguridad.</li>
                        </ul>
                    </div>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Accede a tu factura:</h3>
                        <p>Puedes ver y descargar tu factura usando los siguientes enlaces:</p>
                        <div style="margin: 15px 0;">
                            ${hosted_invoice_url ? `
                                <a href="${hosted_invoice_url}" 
                                   style="display: inline-block; background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px 5px 5px 0;">
                                    Ver factura en línea
                                </a>
                            ` : ''}
                            ${invoice_pdf ? `
                                <a href="${invoice_pdf}" 
                                   style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px 0;">
                                    Descargar PDF
                                </a>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>⚠️ Importante:</strong> Si no actualizas tu método de pago, tu suscripción podría ser suspendida o cancelada. Te recomendamos actuar lo antes posible.</p>
                    </div>
                    
                    <p>Si necesitas ayuda o tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
                    
                    <p style="margin-top: 30px; color: #757575; font-size: 12px;">
                        Este es un email automático, por favor no respondas a este mensaje.
                    </p>
                    
                    <p style="margin-top: 20px;">Saludos,<br><strong>El equipo de ReservAI</strong></p>
                </div>
            `,
            text_content: `
Hola ${name}

Lamentamos informarte que no pudimos procesar el pago de tu factura.

Detalles del pago fallido:
- Monto pendiente: ${currencySymbol}${(amount_due / 100).toFixed(2)}
${number ? `- Número de factura: ${number}` : ''}
${period_start && period_end ? `- Período: ${periodStart} - ${periodEnd}` : ''}
${nextAttempt ? `- Próximo intento: ${nextAttempt}` : ''}
- Estado: Pago fallido

¿Qué puedes hacer?
- Verifica tu método de pago: Asegúrate de que tu tarjeta tenga fondos suficientes y no esté vencida.
- Actualiza tu método de pago: Puedes actualizar tu información de pago desde tu panel de control.
- Contacta a tu banco: A veces los bancos bloquean transacciones por seguridad.

Accede a tu factura:
${hosted_invoice_url ? `Ver factura en línea: ${hosted_invoice_url}` : ''}
${invoice_pdf ? `Descargar PDF: ${invoice_pdf}` : ''}

⚠️ Importante: Si no actualizas tu método de pago, tu suscripción podría ser suspendida o cancelada. Te recomendamos actuar lo antes posible.

Si necesitas ayuda o tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.

Saludos,
El equipo de ReservAI
            `
        }
    }
}

module.exports = PaymentFailedMessage;

