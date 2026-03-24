/**
 * Custom middleware to sanitize incoming data (Zero Trust Approach).
 * Never trust client payloads.
 */

const sanitizeMongo = (obj) => {
    if (obj instanceof Object) {
        for (const key in obj) {
            // Prevent NoSQL Injection
            if (key.includes('$') || key.includes('.')) {
                delete obj[key];
                continue;
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeMongo(obj[key]);
            }
        }
    }
};

const sanitizeXSS = (obj) => {
    if (obj instanceof Object) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Extremely aggressive script tag removal
                obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                // Remove inline event handlers (e.g., onerror=...)
                obj[key] = obj[key].replace(/\bon\w+\s*=\s*['"][^'"]*['"]/gi, '');
                obj[key] = obj[key].replace(/\bon\w+\s*=\s*[^\s>]+/gi, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeXSS(obj[key]);
            }
        }
    }
};

export const sanitizePayload = (req, res, next) => {
    if (req.body) {
        sanitizeMongo(req.body);
        sanitizeXSS(req.body);
    }
    if (req.query) {
        sanitizeMongo(req.query);
        sanitizeXSS(req.query);
    }
    if (req.params) {
        sanitizeMongo(req.params);
        sanitizeXSS(req.params);
    }
    next();
};
