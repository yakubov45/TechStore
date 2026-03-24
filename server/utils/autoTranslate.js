import translate from 'google-translate-api-x';

/**
 * Translates a given text into defined target languages dynamically based on English inputs.
 * Intended to be fired from DB pre-save hooks to zero out frontend translation latency.
 *
 * @param {string} text - The source text (typically English).
 * @param {string[]} targets - Array of language codes (default: ['uz', 'ru']).
 * @returns {Promise<Object>} Object mapping lang code to the translated string.
 */
export const translateText = async (text, targets = ['uz', 'ru']) => {
    if (!text || typeof text !== 'string') return {};

    const results = {};
    for (const lang of targets) {
        try {
            // Rate limits or networking might cause errors, handle cleanly
            const res = await translate(text, { to: lang });
            if (res && res.text) {
                results[lang] = res.text;
            }
        } catch (error) {
            console.warn(`[AutoTranslate] Failed to translate "${text.substring(0, 15)}..." to ${lang}:`, error?.message || error);
        }
    }
    return results;
};
