class EmailManager {

   

    static async sendVerificationEmail(email, subject, content, text_content) {
        try {
            const nodemailer = require('nodemailer');
            
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                throw new Error('EMAIL_USER or EMAIL_PASSWORD environment variables are not set');
            }
            
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: subject,
                html: content,
                text: text_content
            };

            await transporter.sendMail(mailOptions);
            // Log de email removido por seguridad
            return {
                success: true
            }
        } catch (error) {
            console.log('❌ EmailManager: error sending verification email:', error);
            return {
                error: error.message,
                success: false
            }
        }
    }

}

module.exports = EmailManager;