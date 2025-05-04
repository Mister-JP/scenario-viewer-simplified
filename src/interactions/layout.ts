/**
 * LAYOUT PERSISTENCE AND MANAGEMENT
 * 
 * This module handles saving and loading workspace layouts, allowing teams
 * to preserve their scenario arrangements and share them with others.
 * It also provides functionality to reset to a clean grid layout.
 * 
 * Product Features:
 * - Save current card arrangement to JSON file
 * - Load previously saved layouts
 * - Reset to default grid layout
 * - Maintain connections when layouts change
 */

import { CardLayout, Connection } from '../state';
import { $allCards, $allConnections, updateCardPosition, createConnection } from '../state';

/**
 * Interface for saved layout data.
 * Product Context: Complete snapshot of workspace arrangement.
 */
interface SavedLayout {
  /** All cards with their positions and sizes */
  cards: CardLayout[];
  /** All connections between cards */
  connections: Connection[];
  /** Version number for future compatibility */
  version: number;
}

/**
 * Saves the current workspace layout to a JSON file.
 * Product Use Case: Teams can share arrangements or save complex setups.
 */
export function saveLayoutToFile() {
  const cards = $allCards.get();
  const connections = $allConnections.get();
  
  // Strip IDs from connections to avoid conflicts on load
  const connectionsForSave = connections.map(({ id, ...rest }) => rest);
  
  const layoutData: SavedLayout = {
    cards,
    connections: connectionsForSave as Connection[],
    version: 1
  };
  
  // Create downloadable file
  const jsonStr = JSON.stringify(layoutData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Trigger download with date-based filename
  const link = document.createElement('a');
  link.href = url;
  link.download = `scenario-layout-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Loads a workspace layout from a selected file.
 * Product Flow: User selects file → layout is restored → workspace updates
 */
export function loadLayoutFromFile(file: File) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const layoutData = JSON.parse(event.target?.result as string);
      
      // Validate layout structure
      if (!layoutData || 
          typeof layoutData !== 'object' ||
          !Array.isArray(layoutData.cards) ||
          !Array.isArray(layoutData.connections)) {
        throw new Error('Invalid layout format');
      }
      
      // Clear existing state
      $allCards.set([]);
      $allConnections.set([]);
      
      // Restore cards
      $allCards.set(layoutData.cards);
      
      // Recreate connections with new IDs
      layoutData.connections.forEach((conn: any) => {
        createConnection({
          fromCardId: conn.fromCardId,
          fromSide: conn.fromSide,
          fromPosition: conn.fromPosition,
          toCardId: conn.toCardId,
          toSide: conn.toSide,
          toPosition: conn.toPosition
        });
      });
      
    } catch (error) {
      console.error('Failed to load layout:', error);
      alert('Invalid layout file format');
    }
  };
  
  reader.readAsText(file);
}

/**
 * Resets all cards to a clean grid layout.
 * Product Purpose: Quick way to organize workspace from scratch.
 */
export function resetLayout() {
  // Clear connections
  $allConnections.set([]);
  
  // Arrange cards in grid pattern
  const cards = $allCards.get();
  const cols = 3;
  const cardWidth = 350;
  const cardHeight = 250;
  const gap = 24;
  const startX = 20;
  const startY = 80; // Allow space for header
  
  const updatedCards = cards.map((card, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    return {
      ...card,
      x: startX + col * (cardWidth + gap),
      y: startY + row * (cardHeight + gap),
      width: cardWidth,
      height: cardHeight,
      zIndex: 1
    };
  });
  
  $allCards.set(updatedCards);
}

/**
 * Registers the layout persistence system to save automatically.
 * Product Purpose: Ensures user work is preserved even between sessions.
 */
export function initializeLayoutPersistence() {
  // Save layout to localStorage whenever cards or connections change
  $allCards.subscribe(() => {
    saveLayoutToLocalStorage();
  });
  
  $allConnections.subscribe(() => {
    saveLayoutToLocalStorage();
  });
  
  // Try to load from localStorage on startup
  const savedLayout = localStorage.getItem('scenario-viewer-layout');
  if (savedLayout) {
    try {
      const layoutData = JSON.parse(savedLayout);
      $allCards.set(layoutData.cards || []);
      $allConnections.set(layoutData.connections || []);
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }
}

/**
 * Saves the current layout to browser's local storage.
 * Product Context: Automatic backup of user's workspace arrangement.
 */
function saveLayoutToLocalStorage() {
  const cards = $allCards.get();
  const connections = $allConnections.get();
  
  const layoutData = {
    cards,
    connections
  };
  
  try {
    localStorage.setItem('scenario-viewer-layout', JSON.stringify(layoutData));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}