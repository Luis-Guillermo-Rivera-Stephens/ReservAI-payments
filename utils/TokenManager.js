const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;

class TokenManager {
    static VerifyToken(token) {
        try {
            const decoded = jwt.verify(token, secretKey);
            return {
                success: true,
                decoded: decoded
            };
        } catch (err) {
            // Log de error de token removido por seguridad
            return {
                success: false,
                error: `Token is invalid: ${err.message}`
            };
        }
    }
}

module.exports = TokenManager;