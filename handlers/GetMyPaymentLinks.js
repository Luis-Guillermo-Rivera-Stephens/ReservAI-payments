const SubscriptionManager = require('../utils/SubscriptionManager');
const CustomersManager = require('../utils/CustomersManager');
const getStripeInstance = require('../data/StripeInstanceGetter');
const SupportManager = require('../utils/SupportManager');

const GetMyPaymentLinks = async (req, res) => {
    const { customer } = req;
    const { account } = req;
    
    let stripe = null;
    try {
        stripe = await getStripeInstance();
    } catch (error) {
        SupportManager.sendSupportTicket(req, "Error 500 en el handler de GetMyPaymentLinks", error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }

    // Obtener el link del portal de facturación
    const portalResult = await CustomersManager.createPortalSession(
        customer.stripe_customer_id,
        stripe
    );

    let portalUrl = null;
    if (portalResult.success) {
        portalUrl = portalResult.session.url;
    }

    // Crear ambos payment links (básico y premium) redirigiendo al portal
    const result = await SubscriptionManager.createSubscriptionPaymentLinks(
        customer.stripe_customer_id,
        account.id,
        account.email,
        portalUrl,  // success_url -> portal
        portalUrl,  // cancel_url -> portal
        stripe
    );

    if (!result.success) {
        SupportManager.sendSupportTicket(req, "Error 500 en el handler de GetMyPaymentLinks", result.error || result.errors);
        return res.status(500).json({ 
            error: result.error || 'Error creating payment links',
            errors: result.errors
        });
    }

    return res.status(200).json({
        message: result.message,
        paymentLinks: result.paymentLinks
    });
}

module.exports = GetMyPaymentLinks;

