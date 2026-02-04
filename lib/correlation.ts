/**
 * @fileoverview Correlation ID utilities for distributed tracing.
 */

import { v7 as uuidv7 } from 'uuid';

export type CorrelationId = string & { readonly __brand: 'CorrelationId' };

export const CORRELATION_HEADER = 'x-correlation-id';

const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generates a UUIDv7 correlation ID for tracing.
 *
 * @returns A UUIDv7 correlation ID.
 */
export function generateCorrelationId(): CorrelationId {
  return uuidv7() as CorrelationId;
}

/**
 * Validates that a value is a UUIDv7 correlation ID.
 *
 * @param id - Value to validate.
 * @returns True if the value is a UUIDv7 correlation ID.
 */
export function isValidCorrelationId(id: unknown): id is CorrelationId {
  return typeof id === 'string' && UUID_V7_REGEX.test(id);
}
