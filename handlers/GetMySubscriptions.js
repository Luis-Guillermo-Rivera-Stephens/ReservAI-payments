const SubscriptionManager = require('../utils/SubscriptionManager');
const {connectDB} = require('../data/connectDB');
const SupportManager = require('../utils/SupportManager');

const GetMySubscriptions = async (req, res) => {
    const { customer } = req;
    const { account } = req;

    let db = null;
    try {
        db = await connectDB();
    } catch (error) {
        SupportManager.sendSupportTicket(req, "Error 500 en el handler de GetMySubscriptions", error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }

    const result = await SubscriptionManager.getSubscriptionsSummaries(customer.stripe_customer_id, account.id, db);
    if (result.error) {
        SupportManager.sendSupportTicket(req, "Error 500 en el handler de GetMySubscriptions", result.error);
        return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({
        success: true,
        message: 'Suscripciones obtenidas correctamente',
        subscriptions: result.subscriptions
    });
}

module.exports = GetMySubscriptions;