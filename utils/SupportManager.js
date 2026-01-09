const axios = require('axios');
class SupportManager {
    static async sendSupportTicket(req, title = "Error 500 en el servicio de stripe", error){
        try {
            const response = await axios.post(process.env.SUPPORT_API_URL, {
                headers: {
                    'Authorization': process.env.SUPPORT_API_TOKEN
                },
                data: {
                    title: title + " - " + new Date().toISOString() + " - " + process.env.SERVICE,
                    error: error,
                    request: {
                        method: req.method,
                        url: req.url,
                        headers: req.headers,
                        body: req.body,
                        params: req.params,
                        query: req.query
                    }
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
}

module.exports = SupportManager;