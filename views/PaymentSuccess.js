class PaymentSuccessMessage {
    static getMessage(name) {
        return {
            subject: `Pago exitoso - ReservAI`,
            content: `Hola ${name}, tu pago ha sido exitoso.`,
            text_content: `Hola ${name}, tu pago ha sido exitoso.`
        }
    }
}