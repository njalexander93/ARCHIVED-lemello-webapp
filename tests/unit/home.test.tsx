/**
 * @fileoverview Unit tests for the Lemello webapp landing page.
 */

import { render, screen } from '@testing-library/react';

import Home from '@/app/page';

describe('Home page', () => {
  it('renders the coming soon headline', () => {
    // Render the landing page component in a test DOM.
    render(<Home />);

    // Assert the primary headline is present for basic visibility.
    expect(
      screen.getByRole('heading', { name: /coming soon/i })
    ).toBeInTheDocument();
  });
});
