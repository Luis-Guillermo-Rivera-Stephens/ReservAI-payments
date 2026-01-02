const CreateSubscriptionInDB = require('../queries/CreateSubscriptionInDB');
const UpdateSubscriptionInDB = require('../queries/UpdateSubscriptionInDB');
const UpdateSubscriptionOnPaymentSuccess = require('../queries/UpdateSubscriptionOnPaymentSuccess');
const UpdateSubscriptionOnPaymentFailed = require('../queries/UpdateSubscriptionOnPaymentFailed');
const UpdateSubscriptionOnCancellation = require('../queries/UpdateSubscriptionOnCancellation');
const Subscription = require('../models/subscription');

class SubscriptionManager {
    static async createSubscriptionInDB(subscription, db) {
        try {
            const subscriptionData = subscription.toJSON();
            const result = await db.query(CreateSubscriptionInDB, [
                subscriptionData.stripe_customer_id,
                subscriptionData.stripe_subscription_id,
                subscriptionData.stripe_product_id,
                subscriptionData.status,
                subscriptionData.current_period_start,
                subscriptionData.current_period_end,
                subscriptionData.cancel_at_period_end,
                subscriptionData.plan_name,
                subscriptionData.amount,
                subscriptionData.created_at
            ]);
            return {
                success: true,
                message: 'Subscription created successfully',
                subscription: result.rows[0]
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error creating subscription',
                error: error.message
            }
        }
    }

    static async updateSubscriptionInDB(subscription, db) {
        try {
            const subscriptionData = subscription.toJSON();
            const result = await db.query(UpdateSubscriptionInDB, [
                subscriptionData.stripe_customer_id,
                subscriptionData.stripe_subscription_id,
                subscriptionData.stripe_product_id,
                subscriptionData.status,
                subscriptionData.current_period_start,
                subscriptionData.current_period_end,
                subscriptionData.cancel_at_period_end,
                subscriptionData.plan_name,
                subscriptionData.amount
            ]);
            return {
                success: true,
                message: 'Subscription updated successfully',
                subscription: result.rows[0]
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error updating subscription',
                error: error.message
            }
        }
    }

    static async updateSubscriptionOnPaymentSuccess(stripe_customer_id, stripe_subscription_id, period_start, period_end, db) {
        try {
            const result = await db.query(UpdateSubscriptionOnPaymentSuccess, [
                stripe_customer_id,
                stripe_subscription_id,
                period_start,
                period_end
            ]);
            return {
                success: true,
                message: 'Subscription updated on payment success',
                subscription: result.rows[0]
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error updating subscription on payment success',
                error: error.message
            }
        }
    }

    static async updateSubscriptionOnPaymentFailed(stripe_customer_id, stripe_subscription_id, status = 'unpaid', db) {
        try {
            const result = await db.query(UpdateSubscriptionOnPaymentFailed, [
                stripe_customer_id,
                stripe_subscription_id,
                status
            ]);
            return {
                success: true,
                message: 'Subscription updated on payment failed',
                subscription: result.rows[0]
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error updating subscription on payment failed',
                error: error.message
            }
        }
    }

    static async updateSubscriptionOnCancellation(stripe_customer_id, stripe_subscription_id, db) {
        try {
            const result = await db.query(UpdateSubscriptionOnCancellation, [
                stripe_customer_id,
                stripe_subscription_id
            ]);
            return {
                success: true,
                message: 'Subscription updated on cancellation',
                subscription: result.rows[0]
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error updating subscription on cancellation',
                error: error.message
            }
        }
    }
}

module.exports = SubscriptionManager;

