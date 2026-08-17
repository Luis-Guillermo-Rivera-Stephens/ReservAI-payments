const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;
const expiresIn = process.env.JWT_EXPIRES_IN;
const apiKeyExpiresIn = process.env.JWT_API_KEY_EXPIRES_IN || '365d';

class TokenClass {
    constructor(id, token_type, session_version = 0, extra = {}) {
        this.id = id;
        this.token_type = token_type;
        this.session_version = session_version;
        this.extra = extra;
    }

    static FromDecodedInfo(decoded) {
        if (!decoded) {
            return null;
        }

        if (!decoded.id || !decoded.token_type) {
            return null;
        }

        const session_version =
            typeof decoded.session_version === 'number' ? decoded.session_version : 0;
        const { id, token_type, session_version: _sv, iat, exp, ...extra } = decoded;
        return new TokenClass(id, token_type, session_version, extra);
    }

    toToken() {
        return jwt.sign(
            {
                id: this.id,
                token_type: this.token_type,
                session_version: this.session_version,
                ...this.extra,
            },
            secretKey,
            { expiresIn: expiresIn }
        );
    }

    toApiKey() {
        return jwt.sign(
            {
                id: this.id,
                token_type: this.token_type,
                session_version: this.session_version,
            },
            secretKey,
            { expiresIn: apiKeyExpiresIn }
        );
    }

    static AccessToken(id, session_version = 0) {
        return new TokenClass(id, 'access', session_version).toToken();
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