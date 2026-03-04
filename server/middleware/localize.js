/**
 * Middleware to intercept JSON responses and selectively replace localized strings.
 */
export const localizeResponse = (req, res, next) => {
    // Get requested language from header, default to 'en' (or 'uz' if you prefer)
    // The frontend typically sends e.g. "uz", "ru", "en"
    let requestedLang = req.headers['accept-language']?.split(',')[0].substring(0, 2);

    // Default to 'en' if not provided or valid
    if (!requestedLang || !['uz', 'ru', 'en'].includes(requestedLang)) {
        requestedLang = 'en';
    }

    // Capture the original res.json method
    const originalJson = res.json;

    // Override res.json
    res.json = function (body) {
        if (requestedLang !== 'en' && body) {
            try {
                // Ensure we are working with plain JS objects, not Mongoose documents
                // which have complex getters/setters that cause maximum call stack exceeded errors
                let plainBody = body;
                if (typeof body === 'object') {
                    // Fast way to strip all mongoose methods and just get the RAW data
                    plainBody = JSON.parse(JSON.stringify(body));
                }

                // Determine if we are sending data that needs localized
                localizeObject(plainBody, requestedLang);

                // Call the original res.json with the localized body
                return originalJson.call(this, plainBody);
            } catch (err) {
                console.error('Localization Error:', err);
            }
        }
        // Call the original res.json with the (untouched) body
        return originalJson.call(this, body);
    };

    next();
};

/**
 * Recursively scans an object for a `translations` property and
 * replaces base string properties with the localized ones.
 * @param {any} obj - The object to localize
 * @param {string} lang - The target language ('uz' or 'ru')
 */
const localizeObject = (obj, lang) => {
    if (!obj || typeof obj !== 'object') return;

    // Avoid infinite recursion on Mongoose internals or Date objects
    if (obj instanceof Date || obj instanceof RegExp || obj instanceof Error) return;

    // If it's an array, iterate over its items
    if (Array.isArray(obj)) {
        for (const item of obj) {
            localizeObject(item, lang);
        }
        return;
    }

    // If we find `translations`, apply them
    if (obj.translations && obj.translations[lang]) {
        const local = obj.translations[lang];
        if (local.name) obj.name = local.name;
        if (local.description) obj.description = local.description;

        // Hide the translations object from output (optional, to save bandwidth)
        delete obj.translations;
    }

    // Recursively check all nested objects and properties
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Avoid recursing into mongoose specific properties or internals
            if (key === '$__' || key === 'isNew' || key === 'errors' || key === '_doc') continue;

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                localizeObject(obj[key], lang);
            }
        }
    }
};
