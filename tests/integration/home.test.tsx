/**
 * @fileoverview Integration checks for Lemello home page content.
 */

import { render, screen } from '@testing-library/react';

import Home from '@/app/page';

describe('Home page content', () => {
  it('shows the Lemello logo and subtitle', () => {
    // Render the home page component in a test DOM.
    render(<Home />);

    // Validate key brand elements render together.
    expect(screen.getByAltText(/lemello/i)).toBeInTheDocument();
    expect(
      screen.getByText(/today's recipes\. tomorrow's traditions\./i)
    ).toBeInTheDocument();
  });
});
