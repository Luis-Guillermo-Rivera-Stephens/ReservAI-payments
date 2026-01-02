module.exports = `
    UPDATE subscriptions
    SET 
        status = 'canceled',
        cancel_at_period_end = true
    WHERE stripe_customer_id = $1 AND stripe_subscription_id = $2
`;

