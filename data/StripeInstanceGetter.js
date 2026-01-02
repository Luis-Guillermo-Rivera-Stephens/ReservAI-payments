const Stripe = require('stripe');

const getStripeInstance = async () => {
    try {
        return new Stripe(process.env.STRIPE_SECRET_KEY);
    } catch (error) {
        throw new Error('Error getting Stripe instance');
    }
}

module.exports = getStripeInstance;