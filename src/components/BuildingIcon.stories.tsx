import type { Meta, StoryObj } from '@storybook/react';
import BuildingIcon from './BuildingIcon';
import { ElementType } from '../types/gameTypes';

// Metadata for the component
const meta = {
  title: 'Game Components/BuildingIcon',
  component: BuildingIcon,
  tags: ['autodocs'],
  argTypes: {
    owner: {
      control: 'select',
      options: ['player', 'enemy', 'neutral'],
      description: 'Who owns the building'
    },
    element: {
      control: 'select',
      options: ['water', 'fire', 'earth', 'air', undefined],
      description: 'The elemental type of the building'
    },
    variation: {
      control: 'radio',
      options: [1, 2, 3],
      description: 'Visual variation for neutral buildings'
    },
    selected: {
      control: 'boolean',
      description: 'Whether the building is selected'
    },
    isSource: {
      control: 'boolean',
      description: 'Whether the building is a source in an animation'
    },
    isTarget: {
      control: 'boolean',
      description: 'Whether the building is a target in an animation'
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
      description: 'The size of the building icon'
    }
  },
  parameters: {
    layout: 'centered',
  }
} satisfies Meta<typeof BuildingIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base story with controls
export const Default: Story = {
  args: {
    owner: 'player',
    element: 'fire',
    variation: 1,
    selected: false,
    isSource: false, 
    isTarget: false,
    size: 'medium'
  }
};

// Player buildings with different elements
export const PlayerWaterTower: Story = {
  args: {
    owner: 'player',
    element: 'water',
    size: 'medium'
  }
};

export const PlayerFireTower: Story = {
  args: {
    owner: 'player',
    element: 'fire',
    size: 'medium'
  }
};

export const PlayerEarthTower: Story = {
  args: {
    owner: 'player',
    element: 'earth',
    size: 'medium'
  }
};

export const PlayerAirTower: Story = {
  args: {
    owner: 'player',
    element: 'air',
    size: 'medium'
  }
};

// Enemy buildings
export const EnemyTower: Story = {
  args: {
    owner: 'enemy',
    element: 'fire',
    size: 'medium'
  }
};

// Neutral village variations
export const NeutralVillageType1: Story = {
  args: {
    owner: 'neutral',
    variation: 1,
    size: 'medium'
  }
};

export const NeutralVillageType2: Story = {
  args: {
    owner: 'neutral',
    variation: 2,
    size: 'medium'
  }
};

export const NeutralVillageType3: Story = {
  args: {
    owner: 'neutral',
    variation: 3,
    size: 'medium'
  }
};

// Different sizes
export const SmallIcon: Story = {
  args: {
    owner: 'player',
    element: 'fire',
    size: 'small'
  }
};

export const LargeIcon: Story = {
  args: {
    owner: 'player',
    element: 'fire',
    size: 'large'
  }
};

// Different states
export const SelectedIcon: Story = {
  args: {
    owner: 'player',
    element: 'fire',
    selected: true,
    size: 'medium'
  }
};

export const SourceIcon: Story = {
  args: {
    owner: 'player',
    element: 'fire',
    isSource: true,
    size: 'medium'
  }
};

export const TargetIcon: Story = {
  args: {
    owner: 'player',
    element: 'fire',
    isTarget: true,
    size: 'medium'
  }
};

// Gallery of all icons
export const IconGallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', maxWidth: '600px' }}>
      {(['player', 'enemy', 'neutral'] as const).map(owner => (
        <div key={owner} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>{owner.charAt(0).toUpperCase() + owner.slice(1)}</h3>
          
          {owner !== 'neutral' ? (
            // Player/Enemy with elements
            ['water', 'fire', 'earth', 'air'].map(element => (
              <div key={element} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BuildingIcon 
                  owner={owner} 
                  element={element as ElementType} 
                  size="medium" 
                />
                <span style={{ fontSize: '12px', marginTop: '5px' }}>{element}</span>
              </div>
            ))
          ) : (
            // Neutral with variations
            [1, 2, 3].map(variation => (
              <div key={variation} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BuildingIcon 
                  owner={owner} 
                  variation={variation as 1 | 2 | 3} 
                  size="medium" 
                />
                <span style={{ fontSize: '12px', marginTop: '5px' }}>Variation {variation}</span>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  )
}; 