/**
 * ApiKeyManager - Gestión de API Keys
 * 
 * ⚠️  IMPORTANTE: Estas API keys son SOLO para testing/desarrollo
 * En producción, estas deben ser eliminadas y reemplazadas por:
 * - Autenticación JWT completa
 * - OAuth2/OpenID Connect
 * - API keys con rotación automática
 * 
 * Las API keys actuales son hardcodeadas y NO deben usarse en producción
 */
class ApiKeyManager {
    static VerifyApiKey(api_key) {
        // TODO: Eliminar en producción - usar solo JWT tokens
        if (api_key === process.env.APIKEY_ADMIN) {
            return process.env.APIKEY_ID_ADMIN;
        }
        if (api_key === process.env.APIKEY_CLIENT) {
            return process.env.APIKEY_ID_CLIENT;
        }
        return null;
    }
}

module.exports = ApiKeyManager;