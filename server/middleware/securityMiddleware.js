import helmet from 'helmet';

// Security headers middleware
export const securityHeaders = (app) => {
    // Helmet defaults (some already applied in server.js) — keep explicit for clarity
    app.use(helmet({
        crossOriginResourcePolicy: false,
    }));

    // Content Security Policy - conservative default, adjust as needed for external services
    app.use(helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", 'data:'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }));

    // Referrer Policy
    app.use(helmet.referrerPolicy({ policy: 'no-referrer-when-downgrade' }));

    // Permissions Policy (formerly Feature-Policy) - restrict powerful features
    app.use((req, res, next) => {
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        next();
    });

    // Additional headers (some are already applied by helmet)
    app.use((req, res, next) => {
        // Clickjacking protection
        res.setHeader('X-Frame-Options', 'DENY');
        // MIME sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        // Referrer is handled by helmet.referrerPolicy
        next();
    });
};

export default securityHeaders;
