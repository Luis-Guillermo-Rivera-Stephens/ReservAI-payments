const getStripeInstance = require('../data/StripeInstanceGetter');
const CustomersManager = require('../utils/CustomersManager');
const SupportManager = require('../utils/SupportManager');

const CreateStripeCustomer = async (req, res) => {
    const {email, name, id} = req.account;
    let stripe = null;
    try {
        stripe = await getStripeInstance();
    } catch (error) {
        SupportManager.sendSupportTicket(req, "Error 500 en el handler de CreateStripeCustomer", error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }

    const result = await CustomersManager.createCustomerInStripe(id, email, name, stripe);
    if (result.error) {
        SupportManager.sendSupportTicket(req, "Error 500 en el handler de CreateStripeCustomer", result.error);
        return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ message: result.message, customer: result.customer });

}

module.exports = CreateStripeCustomer;