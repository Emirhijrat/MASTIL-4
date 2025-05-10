import { OwnerType } from '../types/gameTypes';

export const getColorClasses = (owner: OwnerType): string => {
  switch (owner) {
    case 'player':
      return 'text-[var(--mastil-player-light)]';
    case 'enemy':
      return 'text-[var(--mastil-enemy-light)]';
    case 'neutral':
      return 'text-[var(--mastil-neutral-light)]';
    default:
      return 'text-[var(--mastil-neutral-light)]';
  }
};

export const getUnitBubbleColor = (owner: OwnerType): string => {
  switch (owner) {
    case 'player':
      return 'bg-[var(--mastil-player)]';
    case 'enemy':
      return 'bg-[var(--mastil-enemy)]';
    default:
      return 'bg-[var(--mastil-neutral)]';
  }
};