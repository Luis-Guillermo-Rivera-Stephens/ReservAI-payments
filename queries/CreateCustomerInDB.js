module.exports = `
    INSERT INTO customers (account_id, stripe_customer_id)
    VALUES ($1, $2)
`;
