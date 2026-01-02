module.exports = `
    UPDATE subscriptions
    SET 
        status = $3,
        current_period_start = NULL,
        current_period_end = NULL
    WHERE stripe_customer_id = $1 AND stripe_subscription_id = $2
`;

