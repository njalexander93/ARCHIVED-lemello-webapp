/**
 * @fileoverview Unit tests for PII scrubber utilities.
 */

import { deepScrub, scrubString } from '@/lib/logger/pii-scrubber';

describe('PII scrubber', () => {
  describe('scrubString', () => {
    it('redacts email addresses', () => {
      // Ensure common email patterns are removed.
      expect(scrubString('Contact user@example.com')).toBe(
        'Contact [REDACTED]'
      );
    });

    it('redacts phone numbers', () => {
      // Verify phone number formats are scrubbed.
      expect(scrubString('Call 555-123-4567')).toBe('Call [REDACTED]');
    });

    it('redacts SSNs', () => {
      // Validate SSN pattern replacement.
      expect(scrubString('SSN 123-45-6789')).toBe('SSN [REDACTED]');
    });

    it('redacts credit card numbers', () => {
      // Confirm card number patterns are scrubbed.
      expect(scrubString('Card 4242 4242 4242 4242')).toBe(
        'Card [REDACTED]'
      );
    });
  });

  describe('deepScrub', () => {
    it('redacts nested sensitive keys', () => {
      // Redact keys like user.email in nested objects.
      const input = { user: { email: 'test@example.com', name: 'Alice' } };
      const result = deepScrub(input);
      expect(result.user.email).toBe('[REDACTED]');
      expect(result.user.name).toBe('Alice');
    });

    it('handles circular references safely', () => {
      // Circular references should not throw and should be redacted.
      const input: { self?: unknown } = {};
      input.self = input;
      const result = deepScrub(input);
      expect(result.self).toBe('[REDACTED]');
    });

    it('handles circular arrays safely', () => {
      // Circular arrays should also be redacted instead of recursing forever.
      const input: unknown[] = [];
      input.push(input);
      const result = deepScrub(input);
      expect(result[0]).toBe('[REDACTED]');
    });

    it('respects maxDepth when scrubbing', () => {
      // Depth limit should stop recursion before deep redaction.
      const input = { level1: { level2: { level3: 'test@example.com' } } };
      const result = deepScrub(input, 1);
      const nested = (result.level1 as { level2?: { level3?: string } }).level2;
      expect(nested?.level3).toBe('test@example.com');
    });
  });
});
