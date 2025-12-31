const CustomersManager = require('../utils/CustomersManager');
const { connectDB } = require('../data/connectDB');

const CustomerIsAvailable = async (req, res, next) => {
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
    if (result.exists) {
        return res.status(400).json({ error: 'Customer already exists' });
    }
    next();
}

module.exports = CustomerIsAvailable;