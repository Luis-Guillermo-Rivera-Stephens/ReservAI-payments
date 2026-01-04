module.exports = `
    SELECT * FROM subscriptions
    WHERE stripe_customer_id = $1 AND account_id = $2
    ORDER BY created_at DESC
`;