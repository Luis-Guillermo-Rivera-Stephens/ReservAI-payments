const CustomersManager = require('../utils/CustomersManager');
const { connectDB } = require('../data/connectDB');

const CustomerExistByID = async (req, res, next) => {
    const account_id = req.account.id;
    let db = null;
    try {
        db = await connectDB();
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
    const result = await CustomersManager.customerExistByID(account_id, db);
    if (result.error) {
        return res.status(500).json({ error: result.error });
    }
    if (!result.exists) {
        return res.status(404).json({ error: 'Customer does not exist' });
    }
    req.customer = result.customer;
    console.log('CustomerExistByID: customer exists');
    next();
}

module.exports = CustomerExistByID;