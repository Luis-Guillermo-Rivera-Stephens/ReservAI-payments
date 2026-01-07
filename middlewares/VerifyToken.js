const TokenClass = require('../utils/TokenClass');
const TokenManager = require('../utils/TokenManager');
const ApiKeyManager = require('../utils/ApiKeyManager');

const VerifyToken = async (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token || typeof token !== 'string') {
        return res.status(418).json({ error: 'Token is required' });
    }

    // En producción, no se permiten API keys
    const IS_PRODUCTION = global.IS_PRODUCTION || process.env.IS_PRODUCTION === 'true';
    
    if (!IS_PRODUCTION) {
        // Solo verificar API keys si NO estamos en producción
        let token_id = ApiKeyManager.VerifyApiKey(token);
        if (token_id) {
            req.token_id = token_id;
            req.token_type = "access";
            next();
            return;
        }
    }
    
    const result = TokenManager.VerifyToken(token);
    
    if (result.error) {
        // Log de error de token removido por seguridad
        return res.status(418).json({ error: result.error });
    }
    
    let token_ = TokenClass.FromDecodedInfo(result.decoded);
    
    if (!token_) {
        // Log de error de estructura removido por seguridad
        return res.status(418).json({ error: 'Invalid token' });
    }

    req.token_id = token_.id;
    req.token_type = token_.token_type;
    next();
}

module.exports = VerifyToken;