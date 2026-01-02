module.exports = `
    UPDATE subscriptions
    SET 
        status = 'active',
        current_period_start = $3,
        current_period_end = $4
    WHERE stripe_customer_id = $1 AND stripe_subscription_id = $2
`;

