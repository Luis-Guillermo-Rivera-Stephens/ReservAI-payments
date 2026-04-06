/**
 * Debe cargarse antes que express (ver server.js).
 * Depende de variables ya cargadas con dotenv en server.js.
 */
const Sentry = require('@sentry/node');

/** Nombre del servicio en el título de issues y tag `service` (opcional: SENTRY_SERVICE_NAME). */
const sentryServiceName = process.env.SENTRY_SERVICE_NAME || 'BackendService';
const sentryTitleBracket = `[${sentryServiceName}]`;

const sentryDsn =
  typeof process.env.SENTRY_DSN === 'string' ? process.env.SENTRY_DSN.trim() : '';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'true',
    tracesSampleRate: Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),
    integrations: [Sentry.expressIntegration()],
    initialScope: {
      tags: { service: sentryServiceName },
    },
    beforeSend(event) {
      if (event.message && typeof event.message === 'string') {
        if (!event.message.startsWith(sentryTitleBracket)) {
          event.message = `${sentryTitleBracket} ${event.message}`;
        }
      }
      const exc = event.exception?.values?.[0];
      if (exc?.value && typeof exc.value === 'string') {
        if (!exc.value.startsWith(sentryTitleBracket)) {
          exc.value = `${sentryTitleBracket} ${exc.value}`;
        }
      }
      return event;
    },
  });
}

module.exports = Sentry;
