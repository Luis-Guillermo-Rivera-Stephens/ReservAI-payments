class CustomerInfo {
    constructor(
        stripe_customer_id,
        account_id,
        created_at = new Date()
    ) {
        this.stripe_customer_id = stripe_customer_id;
        this.account_id = account_id;
        this.created_at = created_at;
    }

    toJSON() {
        return {
            stripe_customer_id: this.stripe_customer_id,
            account_id: this.account_id,
            created_at: this.created_at
        }
    }

    static fromStripeObject(stripeCustomer) {
        return new CustomerInfo(
            stripeCustomer.id,
            stripeCustomer.metadata.user_id,
            new Date(stripeCustomer.created * 1000)
        );
    }
}

module.exports = CustomerInfo;