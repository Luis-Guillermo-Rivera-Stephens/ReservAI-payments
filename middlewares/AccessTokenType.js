const AccessTokenType = async (req, res, next) => {
    console.log('AccessTokenType: starting...');
    const token_type = req.token_type;
    if (token_type !== 'access') {
        console.log('AccessTokenType: invalid token type');
        return res.status(401).json({ error: 'Invalid token type' });
    }
    next();
}

module.exports = AccessTokenType;