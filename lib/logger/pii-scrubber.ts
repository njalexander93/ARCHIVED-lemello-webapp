/**
 * @fileoverview PII scrubbing helpers that redact sensitive log data.
 */

// Pino redact paths for known sensitive fields.
export const REDACT_PATHS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'ssn',
  'creditCard',
  'credit_card',
  'cardNumber',
  'cvv',
  'pin',
  'accessToken',
  'refreshToken',
  'privateKey',
  'private_key',
  '*.password',
  '*.token',
  '*.apiKey',
  'req.headers.authorization',
  'req.headers.cookie',
  'user.email',
  'user.phone',
  'body.password',
  'body.email',
];

// Keys treated as sensitive during deep scrubbing.
const SENSITIVE_KEYS = new Set(
  [
    'password',
    'passwd',
    'pwd',
    'secret',
    'token',
    'apikey',
    'api_key',
    'authorization',
    'cookie',
    'ssn',
    'creditcard',
    'credit_card',
    'cardnumber',
    'cvv',
    'pin',
    'accesstoken',
    'refreshtoken',
    'privatekey',
    'private_key',
    'email',
    'phone',
  ].map((key) => key.toLowerCase())
);

const REDACTED_VALUE = '[REDACTED]';

// Pattern-based redaction for free-form strings.
const PII_PATTERNS: Record<string, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Matches phone-like values with optional country code and separators.
  phone: /\b(?:\+?\d{1,3}[-.\s()]*)?(?:\d[-.\s()]*){7,14}\d\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
};

/**
 * Redact PII patterns from a string value.
 *
 * @param value - String to scrub for PII.
 * @returns Scrubbed string with PII replaced.
 */
export function scrubString(value: string): string {
  let scrubbed = value;
  for (const pattern of Object.values(PII_PATTERNS)) {
    scrubbed = scrubbed.replace(pattern, REDACTED_VALUE);
  }
  return scrubbed;
}

/**
 * Deeply scrub an object or array, redacting sensitive fields and strings.
 *
 * @param input - Value to scrub.
 * @param maxDepth - Max recursion depth for safety.
 * @returns Scrubbed copy of the input.
 */
export function deepScrub<T>(input: T, maxDepth: number = 10): T {
  const seen = new WeakSet<object>();

  const scrubValue = (value: unknown, depth: number): unknown => {
    if (depth > maxDepth) {
      return value;
    }

    if (typeof value === 'string') {
      return scrubString(value);
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((entry) => scrubValue(entry, depth + 1));
    }

    if (typeof value !== 'object') {
      return value;
    }

    const obj = value as Record<string, unknown>;
    // Prevent infinite loops on circular references.
    if (seen.has(obj)) {
      return REDACTED_VALUE;
    }
    seen.add(obj);

    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(obj)) {
      const normalizedKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(normalizedKey)) {
        result[key] = REDACTED_VALUE;
        continue;
      }
      result[key] = scrubValue(nested, depth + 1);
    }
    return result;
  };

  return scrubValue(input, 0) as T;
}
