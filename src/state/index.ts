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
  currentX: number;
  currentY: number;
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
  const cards = $allCards.get();
  const updatedCards = cards.map(card => 
    card.id === cardId ? { ...card, x, y } : card
  );
  $allCards.set(updatedCards);
}

/**
 * Brings a card to the front when selected (prevents it from being hidden).
 * Product Behavior: Recently interacted cards should be visible, not hidden behind others.
 */
export function bringCardToFront(cardId: number): void {
  const cards = $allCards.get();
  const maxZIndex = Math.max(...cards.map(c => c.zIndex), 0);
  const updatedCards = cards.map(card => 
    card.id === cardId ? { ...card, zIndex: maxZIndex + 1 } : card
  );
  $allCards.set(updatedCards);
}

/**
 * Creates a new connection between two cards.
 * Product Flow: User drags from one card to another → connection is created → relationship is visualized
 */
export function createConnection(connection: Omit<Connection, 'id'>): void {
  const connections = $allConnections.get();
  const newConnection: Connection = {
    ...connection,
    id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  $allConnections.set([...connections, newConnection]);
}

/**
 * Removes a specific connection.
 * Product Flow: User deletes a connection → relationship visualization is removed
 */
export function removeConnection(connectionId: string): void {
  const connections = $allConnections.get();
  $allConnections.set(connections.filter(c => c.id !== connectionId));
}

/**
 * Updates the content source URL.
 * Product Impact: Changes where all scenario content is loaded from,
 * useful for switching environments or demos.
 */
export function updateHostUrl(newUrl: string): void {
  const cleanUrl = newUrl.trim().replace(/\/$/, '');
  $hostUrl.set(cleanUrl);
  localStorage.setItem('scenario-host', cleanUrl);
}