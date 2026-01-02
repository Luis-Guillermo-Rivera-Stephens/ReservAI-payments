const uuid = require('uuid');

class PaymentHistory {
    constructor(
        id = uuid.v4(),
        stripe_subscription_id,
        stripe_invoice_id = null,
        stripe_payment_intent_id = null,
        status,
        amount,
        created_at = new Date()
    ) {
        this.id = id;
        this.stripe_subscription_id = stripe_subscription_id;
        this.stripe_invoice_id = stripe_invoice_id;
        this.stripe_payment_intent_id = stripe_payment_intent_id;
        this.status = status;
        this.amount = amount;
        this.created_at = created_at;
    }

    toJSON() {
        return {
            id: this.id,
            stripe_subscription_id: this.stripe_subscription_id,
            stripe_invoice_id: this.stripe_invoice_id,
            stripe_payment_intent_id: this.stripe_payment_intent_id,
            status: this.status,
            amount: this.amount,
            created_at: this.created_at
        }
    }

    // Método estático para crear desde objeto de Stripe Invoice
    static fromStripeInvoice(stripeInvoice) {
        return new PaymentHistory(
            uuid.v4(),
            stripeInvoice.subscription || null,
            stripeInvoice.id,
            stripeInvoice.payment_intent || null,
            stripeInvoice.status,
            stripeInvoice.amount_paid ? stripeInvoice.amount_paid / 100 : 0, // Convertir de centavos a dólares
            new Date(stripeInvoice.created * 1000)
        );
    }
}

module.exports = PaymentHistory;

