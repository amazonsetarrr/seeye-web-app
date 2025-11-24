/**
 * Unified Normalization Service
 * Consolidates all normalization logic for consistent data processing
 */

import {
    STREET_ABBREVIATIONS,
    COMPANY_SUFFIXES,
    COUNTRY_VARIATIONS,
    TITLE_ABBREVIATIONS,
    NORMALIZATION_CONFIG,
} from '../config/matching.config';

/**
 * Basic string normalization (lowercase, trim, remove extra spaces)
 */
export const normalizeString = (str: string): string => {
    return String(str || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
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
    if (digits.length > NORMALIZATION_CONFIG.PHONE_STANDARD_LENGTH &&
        (digits.startsWith('1') || digits.startsWith('44'))) {
        return digits.substring(digits.length - NORMALIZATION_CONFIG.PHONE_STANDARD_LENGTH);
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
 * This is the primary normalization function to use for smart matching
 */
export const smartNormalize = (value: string): string => {
    if (!value) return '';

    const str = String(value).trim();

    // Check if it's a phone number (contains digits and phone-like formatting)
    if (/[\d\(\)\-\s]{7,}/.test(str) && /\d{3,}/.test(str)) {
        const normalized = normalizePhoneNumber(str);
        if (normalized.length >= NORMALIZATION_CONFIG.PHONE_MIN_LENGTH) {
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
