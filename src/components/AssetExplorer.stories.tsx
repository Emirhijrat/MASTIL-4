import type { Meta, StoryObj } from '@storybook/react';
import { GameAssets, AssetKey } from '../assets/assetManager';

// Create a simple component just for the Storybook story
const AssetExplorer = () => {
  const assetCategories = {
    'Towers': Object.keys(GameAssets).filter(key => key.startsWith('TOWER_')),
    'Villages': Object.keys(GameAssets).filter(key => key.startsWith('VILLAGE_')),
    'UI Elements': Object.keys(GameAssets).filter(key => 
      key.startsWith('BUTTON_') || key.startsWith('ICON_')
    ),
    'Backgrounds': Object.keys(GameAssets).filter(key => key.startsWith('BACKGROUND_')),
    'Effects': Object.keys(GameAssets).filter(key => key.startsWith('EFFECT_')),
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Asset Manager Explorer</h1>
      
      {Object.entries(assetCategories).map(([category, keys]) => (
        <div key={category} style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px', borderBottom: '1px solid #374151', paddingBottom: '5px' }}>
            {category}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
            {keys.map((key) => (
              <div 
                key={key} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                  height: '150px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ 
                  height: '80px', 
                  width: '80px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}>
                  <img 
                    src={GameAssets[key as AssetKey]} 
                    alt={key} 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain'
                    }} 
                  />
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  textAlign: 'center', 
                  wordBreak: 'break-word',
                  color: '#D1D5DB'
                }}>
                  {key}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#9CA3AF',
                  marginTop: '4px'
                }}>
                  {GameAssets[key as AssetKey].split('/').pop()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Usage in Code</h3>
        <pre style={{ 
          backgroundColor: '#1F2937', 
          padding: '10px', 
          borderRadius: '4px', 
          fontSize: '12px',
          overflowX: 'auto' 
        }}>
          {`import { getTowerAsset, getVillageAsset } from '../assets/assetManager';

// Get asset for a player tower with fire element
const playerFireTower = getTowerAsset('player', 'fire');
// ${GameAssets.TOWER_PLAYER_FIRE}

// Get asset for a neutral village (variation 2)
const villageType2 = getVillageAsset(2);
// ${GameAssets.VILLAGE_TYPE_2}
`}
        </pre>
      </div>
    </div>
  );
};

const meta = {
  title: 'Asset Management/AssetExplorer',
  component: AssetExplorer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  }
} satisfies Meta<typeof AssetExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Explorer: Story = {}; 