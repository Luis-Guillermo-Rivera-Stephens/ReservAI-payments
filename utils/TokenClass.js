const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;
const expiresIn = process.env.JWT_EXPIRES_IN;
const apiKeyExpiresIn = process.env.JWT_API_KEY_EXPIRES_IN || '365d';

class TokenClass {
    constructor(id, token_type) {
        this.id = id;
        this.token_type = token_type;
    }

    static FromDecodedInfo(decoded) {
        if (!decoded) {
            return null;
        }
        
        if (!decoded.id || !decoded.token_type) {
            return null;
        }
        
        return new TokenClass(decoded.id, decoded.token_type);
    }

    toToken() {
        return jwt.sign({ id: this.id, token_type: this.token_type }, secretKey, { expiresIn: expiresIn });
    }

    toApiKey() {
        return jwt.sign({ id: this.id, token_type: this.token_type }, secretKey, { expiresIn: expiresIn });
    }

    static AccessToken(id) {
        return new TokenClass(id, 'access').toToken();
    }
    static VerificationToken(id) {
        return new TokenClass(id, 'verification').toToken();
    }

    static TwoFactorAuthorizationToken(id) {
        return new TokenClass(id, 'two_factor_authentication').toToken();
    }
    
    static EmailSenderToken(id) {
        return new TokenClass(id, 'email_sender').toToken();
    }

    static ApiKey(id) {
        return new TokenClass(id, 'access').toApiKey();
    }

}

module.exports = TokenClass;