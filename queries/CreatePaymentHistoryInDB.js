module.exports = `
    INSERT INTO payment_history (
        id,
        stripe_subscription_id,
        stripe_invoice_id,
        stripe_payment_intent_id,
        status,
        amount,
        created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
`;

