module.exports = `
    SELECT *
    FROM accounts 
    WHERE email = $1
`;