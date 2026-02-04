/**
 * @fileoverview Unit tests for client-side logger.
 */

import { deepScrub, scrubString } from '@/lib/logger/pii-scrubber';

describe('Client Logger PII Scrubbing', () => {
  describe('scrubString', () => {
    it('redacts email addresses', () => {
      expect(scrubString('User email: user@example.com')).toContain('[REDACTED]');
      expect(scrubString('User email: user@example.com')).not.toContain('@');
    });

    it('redacts phone numbers', () => {
      expect(scrubString('Call 555-123-4567')).toContain('[REDACTED]');
      expect(scrubString('Call +44 20 7946 0958')).toContain('[REDACTED]');
    });

    it('redacts SSNs', () => {
      expect(scrubString('SSN 123-45-6789')).toContain('[REDACTED]');
    });

    it('redacts credit card numbers', () => {
      expect(scrubString('Card 4242 4242 4242 4242')).toContain('[REDACTED]');
    });
  });

  describe('deepScrub', () => {
    it('redacts sensitive keys', () => {
      const input = { password: 'secret123', username: 'alice' };
      const result = deepScrub(input);
      expect(result.password).toBe('[REDACTED]');
      expect(result.username).toBe('alice');
    });

    it('redacts nested sensitive data', () => {
      const input = { user: { email: 'test@example.com', name: 'Alice' } };
      const result = deepScrub(input);
      expect(result.user.email).toBe('[REDACTED]');
      expect(result.user.name).toBe('Alice');
    });

    it('handles circular references safely', () => {
      const input: { self?: unknown } = {};
      input.self = input;
      const result = deepScrub(input);
      expect(result.self).toBe('[REDACTED]');
    });

    it('respects maxDepth when scrubbing', () => {
      const input = { level1: { level2: { level3: 'test@example.com' } } };
      const result = deepScrub(input, 1);
      const nested = (result.level1 as { level2?: { level3?: string } }).level2;
      expect(nested?.level3).toBe('test@example.com');
    });

    it('scrubs arrays of objects', () => {
      const input = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
      ];
      const result = deepScrub(input);
      expect(result[0].email).toBe('[REDACTED]');
      expect(result[0].name).toBe('User 1');
      expect(result[1].email).toBe('[REDACTED]');
      expect(result[1].name).toBe('User 2');
    });

    it('handles tokens and API keys', () => {
      const input = {
        apiKey: 'sk_test_123456',
        accessToken: 'eyJhbGciOi...',
        data: 'public',
      };
      const result = deepScrub(input);
      expect(result.apiKey).toBe('[REDACTED]');
      expect(result.accessToken).toBe('[REDACTED]');
      expect(result.data).toBe('public');
    });
  });
});
