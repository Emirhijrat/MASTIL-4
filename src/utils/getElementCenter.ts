import { Building } from '../types/gameTypes';

export function getElementCenter(el: HTMLElement, container: HTMLElement) {
  const r1 = el.getBoundingClientRect();
  const r2 = container.getBoundingClientRect();
  return {
    x: r1.left - r2.left + r1.width / 2,
    y: r1.top - r2.top + r1.height / 2,
  };
}

export function getBuildingCenter(building: Building, containerWidth: number, containerHeight: number) {
  return {
    x: building.position.x * containerWidth,
    y: building.position.y * containerHeight,
  };
}