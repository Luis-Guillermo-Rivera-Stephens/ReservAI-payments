const VaultCrypto = require('./VaultCrypto');
const TechnicalInfoManager = require('./TechnicalInfoManager');

class PaymentFanout {
    static urlFor(subdomain) {
        return `https://knowledge.${subdomain}.reservai.com.mx/webhooks/payment`;
    }

    static async notifyBySubscriptionId(stripe_subscription_id, status, db) {
        if (!stripe_subscription_id) return;
        const lookup = await TechnicalInfoManager.getForFanout(stripe_subscription_id, db);
        if (!lookup.success || !lookup.tenant) return;
        let token;
        try {
            token = VaultCrypto.decrypt(lookup.tenant.inbound_auth_key);
        } catch {
            return;
        }
        try {
            await fetch(this.urlFor(lookup.tenant.subdomain), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
        } catch {
            // Fan-out is best-effort; webhook ACK already went out.
        }
    }
}

module.exports = PaymentFanout;
