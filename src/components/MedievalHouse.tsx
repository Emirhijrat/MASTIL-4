import React from 'react';

interface MedievalHouseProps {
  variation?: 1 | 2 | 3;
  selected?: boolean;
}

const MedievalHouse: React.FC<MedievalHouseProps> = ({ variation = 1, selected = false }) => {
  const getHousePath = () => {
    switch (variation) {
      case 1:
        return `
          M 20,80 
          L 20,40 
          L 50,20 
          L 80,40 
          L 80,80 
          L 20,80 
          Z
          M 35,80 
          L 35,50 
          L 45,50 
          L 45,80 
          Z
          M 55,80 
          L 55,50 
          L 65,50 
          L 65,80 
          Z
        `;
      case 2:
        return `
          M 25,80 
          L 25,35 
          L 50,15 
          L 75,35 
          L 75,80 
          L 25,80 
          Z
          M 40,80 
          L 40,45 
          L 60,45 
          L 60,80 
          Z
          M 45,45 
          L 45,35 
          L 55,35 
          L 55,45 
          Z
        `;
      case 3:
        return `
          M 30,80 
          L 30,30 
          L 50,10 
          L 70,30 
          L 70,80 
          L 30,80 
          Z
          M 35,80 
          L 35,40 
          L 45,40 
          L 45,80 
          Z
          M 55,80 
          L 55,40 
          L 65,40 
          L 65,80 
          Z
          M 45,40 
          L 45,30 
          L 55,30 
          L 55,40 
          Z
        `;
    }
  };

  return (
    <svg 
      viewBox="0 0 100 100" 
      className="w-full h-full"
      style={{
        filter: selected ? 'drop-shadow(0 0 8px var(--mastil-accent))' : 'none'
      }}
    >
      {/* House base */}
      <path
        d={getHousePath()}
        fill="var(--mastil-neutral)"
        stroke="var(--mastil-neutral-light)"
        strokeWidth="2"
      />
      
      {/* Roof texture */}
      <path
        d="M 20,40 L 50,20 L 80,40"
        fill="none"
        stroke="var(--mastil-neutral-light)"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
      
      {/* Window details */}
      <rect
        x="35"
        y="50"
        width="10"
        height="10"
        fill="var(--mastil-neutral-light)"
        opacity="0.3"
      />
      <rect
        x="55"
        y="50"
        width="10"
        height="10"
        fill="var(--mastil-neutral-light)"
        opacity="0.3"
      />
      
      {/* Door */}
      <rect
        x="45"
        y="60"
        width="10"
        height="20"
        fill="var(--mastil-neutral-light)"
        opacity="0.4"
      />
    </svg>
  );
};

export default MedievalHouse; 