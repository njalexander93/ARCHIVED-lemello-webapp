/**
 * @fileoverview Tailwind CSS configuration for the Lemello webapp.
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  // Files Tailwind should scan for class usage.
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
