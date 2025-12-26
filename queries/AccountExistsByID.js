module.exports = `
    SELECT *
    FROM accounts 
    WHERE id = $1
`;