const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CustomersManager = require('../utils/CustomersManager');
const { connectDB } = require('../data/connectDB');

const CreateStripeCustomer = async (req, res) => {
    const {email, name, id} = req.account;
    let db = null;

    try {
        db = await connectDB();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        return;
    }

    try {
        const customer = await stripe.customers.create({
            email: email,
            name: name,
            metadata: {
                user_id: id
            }
        });

        const result = await CustomersManager.createCustomerInDB(id, customer.id, db);
        if (result.error) {
            console.error('❌ Error creando customer en DB:', result.error);
            res.status(500).json({ error: result.error });
            return;
        }

        res.status(200).json({ message: 'Customer created successfully', customer: result.customer });
    } catch (error) {
        console.error('❌ Error creando customer en Stripe:', error.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
}

module.exports = CreateStripeCustomer;