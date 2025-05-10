import React from 'react';
import { OwnerType } from '../types/gameTypes';

interface BuildingIconProps {
  owner: OwnerType;
}

const BuildingIcon: React.FC<BuildingIconProps> = ({ owner }) => {
  let iconProps = {
    className: "w-1/2 h-1/2 mb-1",
    pathClass: ""
  };
  
  switch (owner) {
    case 'player':
      iconProps.pathClass = "stroke-blue-400 fill-blue-500/30";
      break;
    case 'enemy':
      iconProps.pathClass = "stroke-red-400 fill-red-500/30";
      break;
    case 'neutral':
      iconProps.pathClass = "stroke-gray-400 fill-gray-500/30";
      break;
  }

  return (
    <svg className={iconProps.className} viewBox="0 0 100 100">
      <path 
        d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" 
        className={iconProps.pathClass} 
        strokeWidth="5"
      />
      <path 
        d="M50 35 L65 45 L65 65 L50 75 L35 65 L35 45 Z" 
        className={`${owner === 'player' ? 'fill-blue-400 stroke-blue-300' : 
                      owner === 'enemy' ? 'fill-red-400 stroke-red-300' : 
                      'fill-gray-400 stroke-gray-300'}`} 
        strokeWidth="3"
      />
    </svg>
  );
};

export default BuildingIcon;