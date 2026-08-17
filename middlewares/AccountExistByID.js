const { addRequestTraceStep } = require('../utils/RequestTrace');
const AccountManager = require('../utils/AccountManager');
const { connectDB } = require('../data/connectDB');
const Account = require('../models/account');
const AccountExistByID = async (req, res, next) => {
    console.log('AccountExistByID: starting...');
    const id = req.token_id;
    console.log('AccountExistByID: id', id);
    let db = null;
    try {
        db = await connectDB();
    } catch (error) {
        console.log('AccountExistByID: error', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    
    const result = await AccountManager.accountExistsByID(id, db);
    if (result.error) {
        console.log('AccountExistByID: error', result.error);
        return res.status(500).json({ error: result.error });
    }
    if (!result.exists) {
        console.log('AccountExistByID: account does not exist');
        return res.status(400).json({ error: 'Account does not exist' });
    }
    console.log('AccountExistByID: account exists');
    result.account = new Account(result.account.id, result.account.name, result.account.email, result.account.password, result.account.createdAt, result.account.started, result.account.verified, result.account.type, result.account.twofaenabled, result.account.salt);
    req.account = result.account;
    console.log('AccountExistByID: account exists');
    addRequestTraceStep(req, 'AccountExistByID', {
        account_id: String(result.account.id),
        account_type: result.account.type,
        verified: result.account.verified,
    });
    next();
}

module.exports = AccountExistByID;