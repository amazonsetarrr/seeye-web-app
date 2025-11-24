/**
 * Matching and Normalization Configuration
 * Central configuration for all matching algorithms and normalization rules
 */

/**
 * Street/Address abbreviations mapping
 */
export const STREET_ABBREVIATIONS: Record<string, string[]> = {
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

/**
 * Company suffixes mapping
 */
export const COMPANY_SUFFIXES: Record<string, string[]> = {
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

/**
 * Country codes and names mapping
 */
export const COUNTRY_VARIATIONS: Record<string, string[]> = {
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

/**
 * Common title abbreviations
 */
export const TITLE_ABBREVIATIONS: Record<string, string[]> = {
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
 * Default matching thresholds for different algorithms
 */
export const DEFAULT_THRESHOLDS = {
    EXACT: 1.0,
    FUZZY_HIGH: 0.9,
    FUZZY_MEDIUM: 0.8,
    FUZZY_LOW: 0.7,
    MINIMUM: 0.6,
} as const;

/**
 * Algorithm weights for multi-algorithm matching
 */
export const ALGORITHM_WEIGHTS = {
    LEVENSHTEIN: 0.25,
    JARO_WINKLER: 0.35,
    TOKEN_SET: 0.25,
    PARTIAL: 0.15,
} as const;

/**
 * Normalization settings
 */
export const NORMALIZATION_CONFIG = {
    PHONE_MIN_LENGTH: 7,
    PHONE_STANDARD_LENGTH: 10,
    MAX_PREFIX_LENGTH: 4,
    JARO_PREFIX_SCALE: 0.1,
    JARO_BOOST_THRESHOLD: 0.7,
    PERFECT_MATCH_THRESHOLD: 0.98,
} as const;
