module.exports = `
    SELECT *
    FROM customers
    WHERE account_id = $1
`;