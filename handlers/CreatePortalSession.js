const CustomersManager = require('../utils/CustomersManager');
const getStripeInstance = require('../data/StripeInstanceGetter');

const CreatePortalSession = async (req, res) => {
    const {customer} = req;
    let stripe = null;
    try {
        stripe = await getStripeInstance();
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
    const result = await CustomersManager.createPortalSession(customer.stripe_customer_id, stripe);
    if (result.error) {
        console.error('❌ Error creando portal session:', result.error);
        return res.status(500).json({ error: result.error });
    }
    return res.status(200).json({ session: result.session });

}

module.exports = CreatePortalSession;