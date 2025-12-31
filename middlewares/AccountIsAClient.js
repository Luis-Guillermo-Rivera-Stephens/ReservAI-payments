const AccountIsAClient = async (req, res, next) => {
    console.log('AccountIsAClient: starting...');
    const account = req.account;
    if (account.type !== 'client') {
        console.log('AccountIsAClient: account is not a client');
        return res.status(403).json({ error: 'Account is not a client' });
    }
    console.log('AccountIsAClient: account is a client');
    next();
}

module.exports = AccountIsAClient;