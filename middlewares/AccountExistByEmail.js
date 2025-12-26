const AccountManager = require('../utils/AccountManager');
const { connectDB } = require('../data/connectDB');
const Account = require('../models/account');
const EmailManager = require('../utils/EmailManager');

const AccountExistByEmail = async (req, res, next) => {
    console.log('AccountExistByEmail: starting...');
    const { email } = req.body;
    if (!EmailManager.ValidateEmail(email)) {
        console.log('AccountExistByEmail: invalid email');
        return res.status(400).json({ error: 'Invalid email' });
    }

    let db = null;
    try {
        db = await connectDB();
    } catch (error) {
        console.log('AccountExistByEmail: error', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    
    const result = await AccountManager.accountExistsByEmail(email, db);

    if (result.error) {
        console.log('AccountExistByEmail: error', result.error);
        return res.status(500).json({ error: result.error });
    }
    if (!result.exists) {
        console.log('AccountExistByEmail: account does not exist');
        return res.status(404).json({ error: 'Account does not exist' });
    }
    console.log('AccountExistByEmail: account exists');
    result.account = new Account(result.account.id, result.account.name, result.account.email, result.account.password, result.account.createdAt, result.account.started, result.account.verified, result.account.type, result.account.twofaenabled, result.account.salt);
    req.account = result.account;
    next();
}

module.exports = AccountExistByEmail;