import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/index.css'; // Import your global styles

// Create a decorator to provide game styling and context
const withGameStyling = (Story) => {
  return (
    <div style={{ 
      backgroundColor: '#111827', 
      color: 'white',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <style>
        {`
          :root {
            --mastil-player: #3B82F6;
            --mastil-player-light: #93C5FD;
            --mastil-enemy: #EF4444;
            --mastil-enemy-light: #FCA5A5;
            --mastil-neutral: #9CA3AF;
            --mastil-neutral-light: #D1D5DB;
            --mastil-neutral-dark: #4B5563;
            --mastil-accent: #F59E0B;
            --mastil-border: #374151;
            --mastil-source: #10B981;
            --mastil-target: #7C3AED;
            --game-min-touch: 60px;
          }
        `}
      </style>
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'game',
      values: [
        {
          name: 'game',
          value: '#111827',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
  },
  decorators: [withGameStyling],
};

export default preview; 