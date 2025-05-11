import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PlayerNameInputPopup from './PlayerNameInputPopup';
import { ElementType } from '../types/gameTypes';

const meta = {
  title: 'Game Components/PlayerNameInputPopup',
  component: PlayerNameInputPopup,
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
    isOpen: { control: 'boolean' },
    initialPlayerName: { control: 'text' },
    selectedElement: { 
      control: 'select',
      options: ['water', 'fire', 'earth', 'air', null]
    }
  },
  parameters: {
    layout: 'centered',
  }
} satisfies Meta<typeof PlayerNameInputPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple story with callbacks logged to the Storybook Actions panel
export const Default: Story = {
  args: {
    isOpen: true,
    initialPlayerName: 'Majestät',
    selectedElement: null,
    onSubmit: (playerName, element) => {
      console.log(`Player name: ${playerName}, Element: ${element}`);
    }
  }
};

// An interactive story that maintains state within the story
export const Interactive: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(true);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [playerName, setPlayerName] = useState('Majestät');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
    
    const handleSubmit = (name: string, element: ElementType | null) => {
      setPlayerName(name);
      setSelectedElement(element);
      setIsOpen(false);
      setTimeout(() => setIsOpen(true), 1500); // Re-open after 1.5 seconds
      args.onSubmit?.(name, element);
    };
    
    return (
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Current State:</h3>
          <p>Player Name: <strong>{playerName}</strong></p>
          <p>Selected Element: <strong>{selectedElement || 'None'}</strong></p>
          <button 
            onClick={() => setIsOpen(true)}
            style={{
              padding: '8px 16px',
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isOpen ? 'Popup is Open' : 'Reopen Popup'}
          </button>
        </div>
        
        <PlayerNameInputPopup
          isOpen={isOpen}
          initialPlayerName={playerName}
          selectedElement={selectedElement}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }
};

// Preset elements selected
export const WithWaterElement: Story = {
  args: {
    isOpen: true,
    initialPlayerName: 'Majestät',
    selectedElement: 'water',
    onSubmit: (playerName, element) => {
      console.log(`Player name: ${playerName}, Element: ${element}`);
    }
  }
};

export const WithFireElement: Story = {
  args: {
    isOpen: true,
    initialPlayerName: 'Majestät',
    selectedElement: 'fire',
    onSubmit: (playerName, element) => {
      console.log(`Player name: ${playerName}, Element: ${element}`);
    }
  }
};

export const Closed: Story = {
  args: {
    isOpen: false,
    initialPlayerName: 'Majestät',
    selectedElement: null,
    onSubmit: (playerName, element) => {
      console.log(`Player name: ${playerName}, Element: ${element}`);
    }
  }
}; 