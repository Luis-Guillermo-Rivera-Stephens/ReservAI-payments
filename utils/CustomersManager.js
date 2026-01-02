const CustomerExistByID = require('../queries/CustomerExistByID');
const CreateCustomerInDB = require('../queries/CreateCustomerInDB.js');


class CustomersManager {
    static async customerExistByID(account_id, db) {
        try {
            const result = await db.query(CustomerExistByID, [account_id]);
            return {
                success: true,
                customer: result.rows[0],
                exists: result.rows[0] ? true : false
            }
        } catch (error) {
            return {
                error: error.message,
                success: false
            }
        }
    }

    static async createCustomerInStripe(account_id, email, name, stripe) {
        let customer = null;
        try {
            customer = await stripe.customers.create({
                email: email,
                name: name,
                metadata: {
                    user_id: account_id
                }
            });
            return {
                success: true,
                message: 'Customer created successfully',
                customer: customer
            }
        }
        catch (error) {
            return {
                error: error.message,
                success: false
            }
        }
    }

    static async createCustomerInDB(account_id, customer_id, db) {
        try {
            const result = await db.query(CreateCustomerInDB, [account_id, customer_id]);
            return {
                success: true,
                message: 'Customer created successfully',
                customer: result.rows[0]
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error creating customer',
                error: error.message
            }
        }
    }

    static async createPortalSession(stripe_customer_id, stripe) {
        try {
            const session = await stripe.billingPortal.sessions.create({
                customer: stripe_customer_id,
            });
            return {
                success: true,
                message: 'Portal session created successfully',
                session: session
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error creating portal session',
                error: error.message
            }
        }
    }
}

module.exports =  CustomersManager ;    