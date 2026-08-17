/**
 * Emisión y lectura de cookies de sesión JWT.
 * En producción usa prefijo __Host- (Secure, Path=/).
 * En test/dev usa prefijo pm_ sin Secure (Supertest HTTP).
 * Nombres alineados con PassManagerBackend.
 */

const TOKEN_TYPE_TO_SUFFIX = {
    access: 'access',
    two_factor_authentication: 'two-fa',
    email_sender: 'resend-email',
    confirm_invitation: 'confirm_invitation',
    reset_password: 'confirm_reset_password',
    totp_recovery: 'totp_recovery',
};

const AUTH_COOKIE_SUFFIXES = Object.values(TOKEN_TYPE_TO_SUFFIX);

class CookieAuth {
    static isProduction() {
        return process.env.NODE_ENV === 'production';
    }

    static prefix() {
        return this.isProduction() ? '__Host-pm_' : 'pm_';
    }

    static cookieName(tokenType) {
        const suffix = TOKEN_TYPE_TO_SUFFIX[tokenType];
        if (!suffix) {
            throw new Error(`Unknown token type for cookie: ${tokenType}`);
        }
        return `${this.prefix()}${suffix}`;
    }

    static baseOptions(maxAgeMs) {
        const options = {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: this.isProduction(),
        };
        if (typeof maxAgeMs === 'number') {
            options.maxAge = maxAgeMs;
        }
        return options;
    }

    static setTokenCookie(res, tokenType, tokenValue, maxAgeMs) {
        const name = this.cookieName(tokenType);
        res.cookie(name, tokenValue, this.baseOptions(maxAgeMs));
        return name;
    }

    static clearTokenCookie(res, tokenType) {
        const name = this.cookieName(tokenType);
        res.clearCookie(name, this.baseOptions());
    }

    static clearSessionCookies(res) {
        for (const type of Object.keys(TOKEN_TYPE_TO_SUFFIX)) {
            this.clearTokenCookie(res, type);
        }
    }

    /**
     * Todas las cookies de auth presentes (puede haber más de una).
     * @returns {Array<{ name: string, value: string, suffix: string }>}
     */
    static listAuthCookies(req) {
        const cookies = req.cookies || {};
        const prefix = this.prefix();
        const found = [];
        for (const suffix of AUTH_COOKIE_SUFFIXES) {
            const name = `${prefix}${suffix}`;
            const value = cookies[name];
            if (value && typeof value === 'string') {
                found.push({ name, value, suffix });
            }
        }
        return found;
    }

    /**
     * Compat: primera cookie de auth (preferir vía VerifyToken + TokenManager).
     */
    static extractAuthCookie(req) {
        const list = this.listAuthCookies(req);
        return list.length ? { name: list[0].name, value: list[0].value } : null;
    }

    static TOKEN_TYPE_TO_SUFFIX = TOKEN_TYPE_TO_SUFFIX;
}

module.exports = CookieAuth;
