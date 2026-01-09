const axios = require('axios');
class SupportManager {
    static async sendSupportTicket(req, title = "Error 500 en el servicio de stripe", error){
        try {
            const response = await axios.post(process.env.SUPPORT_API_URL, {
                title: title + " - " + new Date().toISOString() + " - " + process.env.SERVICE,
                type: 'error',
                error: error,
                request: {
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    body: req.body,
                    params: req.params,
                    query: req.query
                }
            }, {
                headers: {
                    'Authorization': process.env.SUPPORT_API_TOKEN
                }
            });
            return {
                success: true,
                response: response.data
            }
        } catch (error) {
            console.error('❌ Error sending support ticket:', error);
            return { error: error.message, success: false };
        }
    }

    static async sendServiceDownTicket(failedCase) {
        try {
            const { account_id, account_name, url, health_webhook } = failedCase;
            const title = `Servicio caído - ${url || 'N/A'} - ${account_name || 'N/A'}`;
            const error = `El servicio de ReservAI está caído o no responde correctamente.\n\n` +
                `Detalles:\n` +
                `- Account Name: ${account_name || 'N/A'}\n` +
                `- Account ID: ${account_id || 'N/A'}\n` +
                `- URL: ${url || 'N/A'}\n` +
                `- Health Webhook: ${health_webhook || 'N/A'}\n` +
                `- Fecha: ${new Date().toISOString()}\n\n` +
                `El health check no está respondiendo correctamente, el servicio puede estar caído o experimentando problemas.`;

            const response = await axios.post(process.env.SUPPORT_API_URL, {
                type: 'service_down',
                title: title + " - " + new Date().toISOString() + " - " + (process.env.SERVICE || 'ReservAI Monitor'),
                error: error,
                service_info: {
                    account_id: account_id,
                    account_name: account_name,
                    url: url,
                    health_webhook: health_webhook
                }
            }, {
                headers: {
                    'Authorization': process.env.SUPPORT_API_TOKEN
                }
            });
            
            return {
                success: true,
                response: response.data
            }
        } catch (error) {
            console.error('❌ Error sending service down ticket:', error.message);
            return { 
                error: error.message, 
                success: false 
            };
        }
    }
}

module.exports = SupportManager;