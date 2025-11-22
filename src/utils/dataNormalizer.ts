/**
 * Data Normalization Utilities
 * Handles common data variations, abbreviations, and formats
 */

// Street/Address abbreviations
const STREET_ABBREVIATIONS: Record<string, string[]> = {
    'street': ['st', 'str', 'street'],
    'avenue': ['ave', 'av', 'avenue'],
    'road': ['rd', 'road'],
    'drive': ['dr', 'drv', 'drive'],
    'lane': ['ln', 'lane'],
    'boulevard': ['blvd', 'boulevard', 'boul'],
    'court': ['ct', 'court'],
    'place': ['pl', 'place'],
    'square': ['sq', 'square'],
    'terrace': ['ter', 'terrace'],
    'parkway': ['pkwy', 'parkway', 'pky'],
    'circle': ['cir', 'circle'],
    'highway': ['hwy', 'highway'],
};

// Company suffixes
const COMPANY_SUFFIXES: Record<string, string[]> = {
    'incorporated': ['inc', 'incorporated', 'incorp'],
    'corporation': ['corp', 'corporation'],
    'company': ['co', 'company'],
    'limited': ['ltd', 'limited'],
    'llc': ['llc', 'limited liability company', 'limited liability co'],
    'llp': ['llp', 'limited liability partnership'],
    'plc': ['plc', 'public limited company'],
    'group': ['grp', 'group'],
    'international': ['intl', 'international', 'int'],
};

// Country codes and names
const COUNTRY_VARIATIONS: Record<string, string[]> = {
    'usa': ['usa', 'us', 'united states', 'united states of america', 'america'],
    'uk': ['uk', 'united kingdom', 'great britain', 'gb', 'britain'],
    'uae': ['uae', 'united arab emirates'],
    'canada': ['ca', 'can', 'canada'],
    'australia': ['au', 'aus', 'australia'],
    'germany': ['de', 'ger', 'germany', 'deutschland'],
    'france': ['fr', 'fra', 'france'],
    'japan': ['jp', 'jpn', 'japan'],
    'china': ['cn', 'chn', 'china', 'prc'],
    'india': ['in', 'ind', 'india'],
};

// Common title abbreviations
const TITLE_ABBREVIATIONS: Record<string, string[]> = {
    'doctor': ['dr', 'doc', 'doctor'],
    'mister': ['mr', 'mister'],
    'mistress': ['mrs', 'mistress'],
    'miss': ['ms', 'miss'],
    'professor': ['prof', 'professor'],
    'reverend': ['rev', 'reverend'],
    'captain': ['capt', 'captain', 'cpt'],
    'lieutenant': ['lt', 'lieut', 'lieutenant'],
    'sergeant': ['sgt', 'sergeant'],
};

/**
 * Normalize a string by replacing common abbreviations with standard forms
 */
export const normalizeAbbreviations = (text: string): string => {
    if (!text) return '';

    let normalized = text.toLowerCase().trim();

    // Replace street abbreviations
    Object.entries(STREET_ABBREVIATIONS).forEach(([standard, variations]) => {
        variations.forEach(variation => {
            const regex = new RegExp(`\\b${variation}\\.?\\b`, 'gi');
            normalized = normalized.replace(regex, standard);
        });
    });

    // Replace company suffixes
    Object.entries(COMPANY_SUFFIXES).forEach(([standard, variations]) => {
        variations.forEach(variation => {
            const regex = new RegExp(`\\b${variation}\\.?\\b`, 'gi');
            normalized = normalized.replace(regex, standard);
        });
    });

    // Replace country variations
    Object.entries(COUNTRY_VARIATIONS).forEach(([standard, variations]) => {
        variations.forEach(variation => {
            const regex = new RegExp(`\\b${variation}\\b`, 'gi');
            normalized = normalized.replace(regex, standard);
        });
    });

    // Replace title abbreviations
    Object.entries(TITLE_ABBREVIATIONS).forEach(([standard, variations]) => {
        variations.forEach(variation => {
            const regex = new RegExp(`^${variation}\\.?\\s`, 'gi');
            normalized = normalized.replace(regex, `${standard} `);
        });
    });

    return normalized;
};

/**
 * Normalize phone numbers - keep only digits
 */
export const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return '';
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Remove leading country codes (1, 44, etc.) if present
    if (digits.length > 10 && (digits.startsWith('1') || digits.startsWith('44'))) {
        return digits.substring(digits.length - 10);
    }
    return digits;
};

/**
 * Normalize email addresses - lowercase and trim
 */
export const normalizeEmail = (email: string): string => {
    if (!email) return '';
    return email.toLowerCase().trim();
};

/**
 * Remove common noise from strings
 */
export const removeNoise = (text: string): string => {
    if (!text) return '';

    return text
        .replace(/[^\w\s]/g, ' ')  // Remove special characters except word chars and spaces
        .replace(/\s+/g, ' ')       // Normalize whitespace
        .trim()
        .toLowerCase();
};

/**
 * Normalize numeric values - remove formatting
 */
export const normalizeNumber = (num: string): string => {
    if (!num) return '';
    // Remove commas, spaces, and currency symbols
    return num.replace(/[$,\s]/g, '');
};

/**
 * Detect data type and apply appropriate normalization
 */
export const smartNormalize = (value: string): string => {
    if (!value) return '';

    const str = String(value).trim();

    // Check if it's a phone number (contains digits and phone-like formatting)
    if (/[\d\(\)\-\s]{7,}/.test(str) && /\d{3,}/.test(str)) {
        const normalized = normalizePhoneNumber(str);
        if (normalized.length >= 7) {
            return normalized;
        }
    }

    // Check if it's an email
    if (/@/.test(str)) {
        return normalizeEmail(str);
    }

    // Check if it's a number with formatting
    if (/^\$?[\d,]+\.?\d*$/.test(str)) {
        return normalizeNumber(str);
    }

    // Apply abbreviation normalization and noise removal
    return removeNoise(normalizeAbbreviations(str));
};

/**
 * Create normalized variations of a string for better matching
 */
export const generateVariations = (text: string): string[] => {
    if (!text) return [''];

    const variations = new Set<string>();

    // Original
    variations.add(text.toLowerCase().trim());

    // Smart normalized
    variations.add(smartNormalize(text));

    // With abbreviations expanded
    variations.add(normalizeAbbreviations(text));

    // Noise removed
    variations.add(removeNoise(text));

    // Tokens sorted (for name matching)
    const tokens = text.toLowerCase().trim().split(/\s+/).sort().join(' ');
    variations.add(tokens);

    return Array.from(variations);
};
