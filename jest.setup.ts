/**
 * @fileoverview Jest setup for the Lemello webapp test suite.
 * Loads testing-library matchers and mocks Next.js utilities.
 */

import '@testing-library/jest-dom';
import React from 'react';

type NextImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
};

// Mock next/image to render a basic <img> in tests.
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: NextImageProps) => {
    const { priority: priorityProp, ...rest } = props;
    void priorityProp;
    return React.createElement('img', rest);
  },
}));
