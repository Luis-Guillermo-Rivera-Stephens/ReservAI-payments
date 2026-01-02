class Subscription {
    constructor(
        stripe_customer_id,
        stripe_subscription_id,
        stripe_product_id = null,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end = false,
        plan_name = null,
        amount,
        created_at = new Date()
    ) {
        this.stripe_customer_id = stripe_customer_id;
        this.stripe_subscription_id = stripe_subscription_id;
        this.stripe_product_id = stripe_product_id;
        this.status = status;
        this.current_period_start = current_period_start;
        this.current_period_end = current_period_end;
        this.cancel_at_period_end = cancel_at_period_end;
        this.plan_name = plan_name;
        this.amount = amount;
        this.created_at = created_at;
    }

    toJSON() {
        return {
            stripe_customer_id: this.stripe_customer_id,
            stripe_subscription_id: this.stripe_subscription_id,
            stripe_product_id: this.stripe_product_id,
            status: this.status,
            current_period_start: this.current_period_start,
            current_period_end: this.current_period_end,
            cancel_at_period_end: this.cancel_at_period_end,
            plan_name: this.plan_name,
            amount: this.amount,
            created_at: this.created_at
        }
    }

    // Método estático para crear desde objeto de Stripe
    static fromStripeObject(stripeSubscription) {
        const items = stripeSubscription.items?.data || [];
        const price = items[0]?.price;
        
        // Manejar product que puede ser un objeto expandido o un ID
        let productId = null;
        if (price?.product) {
            productId = typeof price.product === 'string' 
                ? price.product 
                : price.product.id || null;
        }
        
        // Obtener plan_name del nickname del price o del nombre del product
        let planName = price?.nickname || null;
        if (!planName && price?.product && typeof price.product === 'object') {
            planName = price.product.name || null;
        }
        
        return new Subscription(
            stripeSubscription.customer,
            stripeSubscription.id,
            productId,
            stripeSubscription.status,
            new Date(stripeSubscription.current_period_start * 1000),
            new Date(stripeSubscription.current_period_end * 1000),
            stripeSubscription.cancel_at_period_end || false,
            planName,
            price?.unit_amount ? price.unit_amount / 100 : 0, // Convertir de centavos a dólares
            new Date(stripeSubscription.created * 1000)
        );
    }
}

module.exports = Subscription;
