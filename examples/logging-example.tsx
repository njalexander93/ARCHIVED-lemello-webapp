/**
 * @fileoverview Server-side example usage of structured logging utilities.
 */

import { serverLogger } from '@/lib/logger/server';

/**
 * Example API route handler with server logging.
 *
 * @returns JSON response.
 */
export async function GET(): Promise<Response> {
  // Server-side logger usage: create a child logger with module metadata.
  const logger = serverLogger.child({ module: 'recipes-api' });
  logger.info({ action: 'fetch' }, 'Fetching recipes');

  try {
    // Simulated data fetch for demonstration purposes.
    const recipes = [{ id: 'demo', title: 'Sample' }];
    logger.info(
      { action: 'fetch', count: recipes.length },
      'Recipes fetched'
    );
    return Response.json(recipes);
  } catch (error) {
    logger.error({ action: 'fetch' }, 'Failed to fetch recipes', error as Error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
