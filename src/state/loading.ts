// src/state/loading.ts
import { log } from '../utils/logger';
import { CardLayout } from './index';
import { $allCards } from './index';

export function loadDefaultCards(): void {
  log('loadDefaultCards called');
  
  const defaultCards: CardLayout[] = [1, 2, 3, 4, 5, 6].map((id, index) => {
    log(`Creating card ${id}, index ${index}`);
    const cols = 3;
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const card = {
      id,
      x: 20 + col * 374,
      y: 80 + row * 274,
      width: 350,
      height: 250,
      zIndex: 1
    };
    
    log(`Card ${id} positioned at`, { x: card.x, y: card.y });
    return card;
  });
  
  log('Setting default cards in store', { count: defaultCards.length });
  $allCards.set(defaultCards);
  log('Default cards loaded successfully');
}