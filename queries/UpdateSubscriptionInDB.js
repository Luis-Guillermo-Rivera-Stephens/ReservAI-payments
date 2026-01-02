module.exports = `
    UPDATE subscriptions
    SET 
        stripe_product_id = $3,
        status = $4,
        current_period_start = $5,
        current_period_end = $6,
        cancel_at_period_end = $7,
        plan_name = $8,
        amount = $9
    WHERE stripe_customer_id = $1 AND stripe_subscription_id = $2
`;

