module.exports = `
    SELECT a.email, a.name 
    FROM customers c
    INNER JOIN accounts a ON c.account_id = a.id
    WHERE c.stripe_customer_id = $1
`;