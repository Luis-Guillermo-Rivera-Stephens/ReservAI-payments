const CustomersManager = require('../utils/CustomersManager');

const CreatePortalSession = async (req, res) => {
    const {customer} = req;
    const result = await CustomersManager.createPortalSession(customer.stripe_customer_id);
    if (result.error) {
        console.error('❌ Error creando portal session:', result.error);
        res.status(500).json({ error: result.error });
        return;
    }
    res.status(200).json({ session: result.session });
    return;
}

module.exports = CreatePortalSession;