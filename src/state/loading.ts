/**
 * INITIAL SCENARIO LOADING LOGIC
 * 
 * This module handles creating the initial set of scenario cards when the
 * application first starts or when users reset the workspace.
 * 
 * Product Purpose: Provides a clean starting point with all available scenarios
 * arranged in an organized grid pattern.
 */

import { CardLayout } from './index';
import { $allCards } from './index';

/**
 * Loads the default set of scenario cards into the workspace.
 * Product Context: Provides initial content for new users or after reset.
 * 
 * Layout Details:
 * - 6 scenarios (1-6) arranged in a 3-column grid
 * - Each card is sized 350x250 pixels
 * - Cards are spaced 24 pixels apart
 * - Grid starts 20 pixels from left, 80 pixels from top (allowing for header)
 */
export function loadDefaultCards(): void {
  // Create cards for scenarios 1-6
  const defaultCards: CardLayout[] = [1, 2, 3, 4, 5, 6].map((id, index) => {
    const cols = 3;
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    return {
      id,
      x: 20 + col * 374,  // 350px width + 24px gap
      y: 80 + row * 274,  // 250px height + 24px gap
      width: 350,
      height: 250,
      zIndex: 1
    };
  });
  
  $allCards.set(defaultCards);
}