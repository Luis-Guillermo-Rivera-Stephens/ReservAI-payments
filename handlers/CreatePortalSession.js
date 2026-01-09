const CustomersManager = require('../utils/CustomersManager');
const getStripeInstance = require('../data/StripeInstanceGetter');
const SupportManager = require('../utils/SupportManager');

const CreatePortalSession = async (req, res) => {
    const {customer} = req;
    let stripe = null;
    try {
        stripe = await getStripeInstance();
    } catch (error) {
        SupportManager.sendSupportTicket(req, "Error 500 en el handler de CreatePortalSession", error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
    const result = await CustomersManager.createPortalSession(customer.stripe_customer_id, stripe);
    if (result.error) {
        SupportManager.sendSupportTicket(req, "Error 500 en el handler de CreatePortalSession", result.error);
        return res.status(500).json({ error: result.error });
    }
    return res.status(200).json({ session: result.session });

}

module.exports = CreatePortalSession;