class PaymentSucceededMessage {
    static getMessage(name, invoiceData) {
        const { 
            amount_paid, 
            invoice_pdf, 
            hosted_invoice_url,
            period_start,
            period_end,
            number,
            currency = 'usd'
        } = invoiceData;
        
        const formattedAmount = `$${(amount_paid / 100).toFixed(2)}`;
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

        return {
            subject: `Confirmación de pago - Factura ${number || ''} - ReservAI`,
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4CAF50;">¡Hola ${name}!</h2>
                    <p>Te confirmamos que hemos recibido tu pago exitosamente.</p>
                    
                    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                        <h3 style="margin-top: 0; color: #2e7d32;">Detalles del pago:</h3>
                        <p><strong>Monto pagado:</strong> ${currencySymbol}${(amount_paid / 100).toFixed(2)}</p>
                        ${number ? `<p><strong>Número de factura:</strong> ${number}</p>` : ''}
                        ${period_start && period_end ? `
                            <p><strong>Período:</strong> ${periodStart} - ${periodEnd}</p>
                        ` : ''}
                        <p><strong>Estado:</strong> <span style="color: #4CAF50; font-weight: bold;">Pagado</span></p>
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
                    
                    <p>Gracias por tu pago. Tu suscripción está activa y funcionando correctamente.</p>
                    
                    <p>Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.</p>
                    
                    <p style="margin-top: 30px; color: #757575; font-size: 12px;">
                        Este es un email automático, por favor no respondas a este mensaje.
                    </p>
                    
                    <p style="margin-top: 20px;">Saludos,<br><strong>El equipo de ReservAI</strong></p>
                </div>
            `,
            text_content: `
¡Hola ${name}!

Te confirmamos que hemos recibido tu pago exitosamente.

Detalles del pago:
- Monto pagado: ${currencySymbol}${(amount_paid / 100).toFixed(2)}
${number ? `- Número de factura: ${number}` : ''}
${period_start && period_end ? `- Período: ${periodStart} - ${periodEnd}` : ''}
- Estado: Pagado

Accede a tu factura:
${hosted_invoice_url ? `Ver factura en línea: ${hosted_invoice_url}` : ''}
${invoice_pdf ? `Descargar PDF: ${invoice_pdf}` : ''}

Gracias por tu pago. Tu suscripción está activa y funcionando correctamente.

Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.

Saludos,
El equipo de ReservAI
            `
        }
    }
}

module.exports = PaymentSucceededMessage;

