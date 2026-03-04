/**
 * Translates a given text to multiple languages using the free Google Translate API.
 * @param {string} text - The text to translate (assumed to be English).
 * @param {string[]} targetLangs - Array of language codes to translate into.
 * @returns {Promise<Object>} - Object with language codes as keys and translated strings as values.
 */
export const translateText = async (text, targetLangs = ['uz', 'ru']) => {
    if (!text) return null;

    const results = {};
    for (const lang of targetLangs) {
        try {
            const encodedText = encodeURIComponent(text);
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodedText}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Text is returned in chunks: data[0] is an array of [translated_snippet, ...].
            let translatedRes = '';
            if (data && data[0]) {
                data[0].forEach(chunk => {
                    if (chunk[0]) translatedRes += chunk[0];
                });
            }

            results[lang] = translatedRes || text;

            // Small delay to prevent rate limiting
            await new Promise(r => setTimeout(r, 600));
        } catch (error) {
            console.error(`Translation fetch error for ${lang}:`, error.message);
            // Fallback to original text if translation fails
            results[lang] = text;
        }
    }
    return results;
};

/**
 * Helper to translate name and description for entities.
 * Returns a translations object suitable for saving in the database.
 * @param {string} name - The name to translate.
 * @param {string} description - The description to translate.
 * @returns {Promise<Object>}
 */
export const generateTranslations = async (name, description) => {
    const translations = {
        uz: {},
        ru: {}
    };

    if (name) {
        const nameResults = await translateText(name);
        translations.uz.name = nameResults?.uz || name;
        translations.ru.name = nameResults?.ru || name;
    }

    if (description) {
        const descResults = await translateText(description);
        translations.uz.description = descResults?.uz || description;
        translations.ru.description = descResults?.ru || description;
    }

    return translations;
};
