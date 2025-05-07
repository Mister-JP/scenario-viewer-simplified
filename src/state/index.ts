/**
 * SCENARIO VIEWER STATE MANAGEMENT
 * 
 * This file contains all the "memory" of our application - everything that needs 
 * to be remembered as users interact: which cards are where, how they're connected,
 * what URL they're loading content from, etc.
 * 
 * Naming Convention: Each store starts with $ to indicate it's a reactive state
 * that automatically updates the UI when changed.
 */

import { atom } from 'nanostores';
import { log, error } from '../utils/logger'; // Added error


/**
 * Represents the position and size of a scenario card on the workspace.
 * Product Meaning: Where users have placed each scenario view and how large
 * they've made it (for content emphasis or better visibility).
 */
export interface CardLayout {
  /** Scenario identifier (1-6) matching the iframe content */
  id: number;
  /** Distance from left edge of workspace in pixels */
  x: number;
  /** Distance from top edge of workspace in pixels */  
  y: number;
  /** Card width for content size adjustment */
  width: number;
  /** Card height for content size adjustment */
  height: number;
  /** Visual stacking order (higher numbers appear on top) */
  zIndex: number;
}

/**
 * Represents a visual connection between two scenario cards.
 * Product Meaning: Shows relationships or flow between scenarios,
 * helping teams understand dependencies or sequences.
 */
export interface Connection {
  /** Unique identifier for this connection */
  id: string;
  /** Source card's scenario ID */
  fromCardId: number;
  /** Side of source card (0=top, 1=right, 2=bottom, 3=left) */
  fromSide: number;
  /** Relative position along source card's edge (0-1) */
  fromPosition: number;
  /** Target card's scenario ID */
  toCardId: number;
  /** Side of target card where arrow points */
  toSide: number;
  /** Relative position along target card's edge (0-1) */
  toPosition: number;
}

/**
 * All scenario cards currently displayed in the workspace.
 * Product Context: This is the visual workspace where teams arrange their scenarios.
 */
export const $allCards = atom<CardLayout[]>([]);

/**
 * All visual connections between cards.
 * Product Context: These arrows help teams see relationships between scenarios.
 */
export const $allConnections = atom<Connection[]>([]);

/**
 * The card currently being moved by the user.
 * Product Context: Helps highlight and track what the user is actively arranging.
 */
export const $activeDraggedCard = atom<number | null>(null);

/**
 * Temporary connection line being drawn by the user.
 * Product Context: Shows real-time feedback as users create new relationships.
 */
export const $pendingConnection = atom<{
  fromCardId: number;
  fromSide: number;
  startX: number; // Added for potential calculations relative to SVG/workspace start
  startY: number; // Added for potential calculations
  currentX: number; // Mouse position relative to viewport
  currentY: number; // Mouse position relative to viewport
} | null>(null);

/**
 * The URL from which scenario content is loaded.
 * Product Context: Allows teams to switch between different content sources
 * (development, staging, production, etc.)
 */
export const $hostUrl = atom<string>(
  localStorage.getItem('scenario-host') || 'http://localhost:8080'
);

/**
 * Actions that modify state in response to user interactions.
 * These are the "verbs" of our application - what users can DO.
 */

/**
 * Updates a card's position as the user drags it.
 * Product Flow: User clicks and drags a card → we update its position → UI refreshes
 */
export function updateCardPosition(cardId: number, x: number, y: number): void {
    // log('Update card position action', { cardId, x, y }); // Can be verbose
    
    const currentCards = $allCards.get();
    const updatedCards = currentCards.map(card => 
      card.id === cardId ? { ...card, x, y } : card
    );
    
    if (JSON.stringify(currentCards) !== JSON.stringify(updatedCards)) {
        $allCards.set(updatedCards);
        // log('Card position updated in store', { cardId, newPosition: { x, y } }); // Can be verbose
    }
  }

/**
 * Brings a card to the front when selected (prevents it from being hidden).
 * Product Behavior: Recently interacted cards should be visible, not hidden behind others.
 */
export function bringCardToFront(cardId: number): void {
  const cards = $allCards.get();
  if (cards.length === 0) { // Handle empty case
    log('bringCardToFront: No cards to bring to front.');
    return;
  }
  const maxZIndex = Math.max(...cards.map(c => c.zIndex), 0); // Default to 0 if no cards or all zIndex are < 0
  
  const cardToUpdate = cards.find(c => c.id === cardId);
  if (cardToUpdate && cardToUpdate.zIndex <= maxZIndex) { // Only update if not already on top
    const updatedCards = cards.map(card => 
        card.id === cardId ? { ...card, zIndex: maxZIndex + 1 } : card
    );
    $allCards.set(updatedCards);
    log('Card brought to front', { cardId, newZIndex: maxZIndex + 1 });
  } else if (!cardToUpdate) {
    error('bringCardToFront: Card not found', { cardId });
  }
}

/**
 * Creates a new connection between two cards.
 * Product Flow: User drags from one card to another → connection is created → relationship is visualized
 */
export function createConnection(connectionData: Omit<Connection, 'id'>): void {
    log('Creating connection action', connectionData);
    
    const currentConnections = $allConnections.get();
    // Prevent duplicate connections (optional, based on product needs)
    const existing = currentConnections.find(c =>
        c.fromCardId === connectionData.fromCardId && c.toCardId === connectionData.toCardId &&
        c.fromSide === connectionData.fromSide && c.toSide === connectionData.toSide
    );
    if (existing) {
        log('Connection already exists, not creating duplicate.', { connectionData });
        return;
    }

    const newConnection: Connection = {
      ...connectionData,
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    $allConnections.set([...currentConnections, newConnection]);
    log('Connection created in store', { connectionId: newConnection.id });
  }

/**
 * Removes a specific connection.
 * Product Flow: User deletes a connection → relationship visualization is removed
 */
export function removeConnection(connectionId: string): void {
  log('Removing connection action', { connectionId });
  const currentConnections = $allConnections.get();
  const updatedConnections = currentConnections.filter(c => c.id !== connectionId);
  
  if (currentConnections.length !== updatedConnections.length) {
    $allConnections.set(updatedConnections);
    log('Connection removed from store', { connectionId });
  } else {
    log('Connection to remove not found in store', { connectionId });
  }
}

/**
 * Updates the content source URL.
 * Product Impact: Changes where all scenario content is loaded from,
 * useful for switching environments or demos.
 */
export function updateHostUrl(newUrl: string): void {
  const trimmedUrl = newUrl.trim();
  if (!trimmedUrl) {
    error('updateHostUrl: New URL is empty, not updating.');
    return;
  }
  const cleanUrl = trimmedUrl.replace(/\/$/, ''); // Remove trailing slash
  
  log('Updating host URL action', { oldUrl: $hostUrl.get(), newUrl: cleanUrl });
  $hostUrl.set(cleanUrl);
  try {
    localStorage.setItem('scenario-host', cleanUrl);
    log('Host URL saved to localStorage.');
  } catch (e) {
    error('Failed to save host URL to localStorage', e);
  }
}