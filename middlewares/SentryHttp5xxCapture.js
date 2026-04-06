const { buildSentryFlowContext } = require('../utils/RequestTrace');

/**
 * Captura respuestas HTTP >= 500 hacia Sentry cuando los handlers no usan next(err).
 * Se envuelve res.send (no solo res.json): Express implementa json() como stringify + send(),
 * y otros middlewares pueden restaurar res.json pero siguen pasando por send().
 */
function sentryHttp5xxCapture(req, res, next) {
    if (!process.env.SENTRY_DSN) {
        return next();
    }

    const origSend = res.send.bind(res);
    res.send = function sentrySendWrapper(body) {
        if (!res._sentry5xxReported && res.statusCode >= 500 && !res.sentry) {
            res._sentry5xxReported = true;
            try {
                const Sentry = require('@sentry/node');
                let detail = '';
                if (body != null) {
                    if (typeof body === 'string') {
                        try {
                            const parsed = JSON.parse(body);
                            if (parsed && typeof parsed.error === 'string') {
                                detail = parsed.error.slice(0, 500);
                            }
                        } catch {
                            detail = body.slice(0, 500);
                        }
                    } else if (typeof body === 'object' && typeof body.error === 'string') {
                        detail = body.error.slice(0, 500);
                    }
                }
                const msg = detail ? `HTTP ${res.statusCode}: ${detail}` : `HTTP ${res.statusCode}`;

                Sentry.withScope((scope) => {
                    scope.setTag('error_source', 'http_response');
                    scope.setTag('http_status', String(res.statusCode));
                    const flowCtx = buildSentryFlowContext(req);
                    scope.setContext('request_flow', flowCtx);
                    const actorId = flowCtx.actor?.account_id;
                    if (actorId) scope.setUser({ id: actorId });
                    else if (req.account?.id) scope.setUser({ id: String(req.account.id) });
                    Sentry.captureMessage(msg, 'error');
                });
            } catch {
                /* no bloquear la respuesta */
            }
        }
        return origSend(body);
    };

    next();
}

module.exports = { sentryHttp5xxCapture };
