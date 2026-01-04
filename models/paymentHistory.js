const uuid = require('uuid');

class PaymentHistory {
    constructor(
        id = uuid.v4(),
        stripe_subscription_id,
        stripe_invoice_id = null,
        status,
        amount,
        invoice_pdf = null,
        created_at = new Date()
    ) {
        this.id = id;
        this.stripe_subscription_id = stripe_subscription_id;
        this.stripe_invoice_id = stripe_invoice_id;
        this.status = status;
        this.amount = amount;
        this.invoice_pdf = invoice_pdf;
        this.created_at = created_at;
    }

    toJSON() {
        return {
            id: this.id,
            stripe_subscription_id: this.stripe_subscription_id,
            stripe_invoice_id: this.stripe_invoice_id,
            status: this.status,
            amount: this.amount,
            invoice_pdf: this.invoice_pdf,
            created_at: this.created_at
        }
    }

    // Método estático para crear desde objeto de Stripe Invoice
    static fromStripeInvoice(stripeInvoice) {
        // Obtener el monto: primero amount_paid, luego amount_due, luego total
        let amount = 0;
        if (stripeInvoice.amount_paid && stripeInvoice.amount_paid > 0) {
            amount = stripeInvoice.amount_paid / 100; // Convertir de centavos a dólares
        } else if (stripeInvoice.amount_due) {
            amount = stripeInvoice.amount_due / 100; // Convertir de centavos a dólares
        } else if (stripeInvoice.total) {
            amount = stripeInvoice.total / 100; // Convertir de centavos a dólares
        }
        
        // Manejar subscription: buscar en múltiples ubicaciones
        let subscriptionId = null;
        
        // 1. Buscar directamente en el invoice (si existe)
        if (stripeInvoice.subscription) {
            subscriptionId = typeof stripeInvoice.subscription === 'string' 
                ? stripeInvoice.subscription 
                : stripeInvoice.subscription.id || null;
        }
        
        // 2. Buscar en parent.subscription_details.subscription
        if (!subscriptionId && stripeInvoice.parent?.subscription_details?.subscription) {
            subscriptionId = typeof stripeInvoice.parent.subscription_details.subscription === 'string'
                ? stripeInvoice.parent.subscription_details.subscription
                : stripeInvoice.parent.subscription_details.subscription.id || null;
        }
        
        // 3. Buscar en lines.data[0].parent.subscription_item_details.subscription
        if (!subscriptionId && stripeInvoice.lines?.data && stripeInvoice.lines.data.length > 0) {
            const firstLine = stripeInvoice.lines.data[0];
            if (firstLine.parent?.subscription_item_details?.subscription) {
                subscriptionId = typeof firstLine.parent.subscription_item_details.subscription === 'string'
                    ? firstLine.parent.subscription_item_details.subscription
                    : firstLine.parent.subscription_item_details.subscription.id || null;
            }
        }
        
        // Obtener invoice_pdf si está disponible
        const invoicePdf = stripeInvoice.invoice_pdf || null;
        
        return new PaymentHistory(
            uuid.v4(),
            subscriptionId,
            stripeInvoice.id,
            stripeInvoice.status,
            amount,
            invoicePdf,
            new Date(stripeInvoice.created * 1000)
        );
    }
}

module.exports = PaymentHistory;

