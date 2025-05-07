// src/interactions/connections.ts
/**
 * CONNECTION DRAWING INTERACTIONS
 * 
 * This module handles the creation of visual connections between scenario cards.
 * Users can draw connection lines by dragging from one card to another,
 * creating visual representations of relationships or dependencies.
 * 
 * Product Features:
 * - Click and drag from any card edge dot to another card
 * - Real-time preview line during drawing
 * - Automatic snapping to nearest connection point
 * - Connection removal via double-click
 */

import { 
  $pendingConnection, 
  $allConnections, 
  createConnection, 
  Connection 
} from '../state';
import { log, error } from '../utils/logger';

/**
 * Initializes the connection drawing system.
 * Product Purpose: Enables teams to visually link related scenarios.
 */
export function setupConnectionSystem() {
  const workspace = document.getElementById('workspace');
  if (!workspace) {
    error('Cannot setup connection system: workspace element not found');
    return;
  }
  log('Workspace found for connection system', { id: workspace.id });
  
  // Listen for connection initiation (clicking on dots)
  workspace.addEventListener('pointerdown', handlePossibleConnectionStart, true); // Use capture phase for early intervention
  
  // Track mouse movement during connection drawing
  document.addEventListener('pointermove', handleConnectionDragMove);
  
  // Finalize or cancel connection drawing
  document.addEventListener('pointerup', handleConnectionEnd);
}

/**
 * Detects when user starts drawing a connection from a card dot.
 * Product Flow: User clicks on a dot → connection drawing begins
 */
function handlePossibleConnectionStart(event: PointerEvent) {
  const dot = (event.target as Element).closest('.connection-dot');
      
  if (!dot) {
    return; 
  }

  log('Connection dot clicked', { 
    dotClass: dot.className,
    attributes: Array.from(dot.attributes).map(a => ({ name: a.name, value: a.value }))
  });
  
  // *** CRITICAL: Prevent card drag and other behaviors immediately ***
  event.preventDefault(); 
  event.stopPropagation();
  log('Connection start: event.preventDefault() and event.stopPropagation() called immediately for dot.');

  const cardIdStr = dot.getAttribute('data-card-id');
  const sideStr = dot.getAttribute('data-side');

  if (!cardIdStr || !sideStr) {
    error('handlePossibleConnectionStart - Missing data attributes on dot', { cardIdStr, sideStr });
    return;
  }

  const cardId = parseInt(cardIdStr, 10);
  const side = parseInt(sideStr, 10);
  
  if (isNaN(cardId) || isNaN(side)) {
    error('handlePossibleConnectionStart - Invalid connection data (NaN)', { 
      cardId, 
      side,
      dotAttributes: Array.from(dot.attributes).map(a => `${a.name}="${a.value}"`)
    });
    return;
  }
  
  const pendingState = {
    fromCardId: cardId,
    fromSide: side,
    startX: event.clientX, 
    startY: event.clientY,
    currentX: event.clientX,
    currentY: event.clientY
  };
  
  log('Setting pending connection state', {
    newState: pendingState
  });
  
  $pendingConnection.set(pendingState);
}

/**
 * Updates the preview connection line as user moves mouse.
 * Product Feedback: Shows real-time line from starting point to cursor.
 */
function handleConnectionDragMove(event: PointerEvent) {
  const pending = $pendingConnection.get();
  if (!pending) return;
  
  // Prevent default to avoid text selection during drag
  event.preventDefault();

  $pendingConnection.set({
    ...pending,
    currentX: event.clientX,
    currentY: event.clientY
  });
  // log('Pending connection move', { currentX: event.clientX, currentY: event.clientY }); // Can be very verbose
}

/**
 * Completes or cancels connection drawing when mouse released.
 * Product Logic: If released over another card's dot, create connection.
 * Otherwise, cancel the operation.
 */
function handleConnectionEnd(event: PointerEvent) {
  const pending = $pendingConnection.get();
  if (!pending) return;
  
  log('handleConnectionEnd - Pending connection exists', { pending });
  
  // Clear pending state REGARDLESS of target, so the line disappears
  $pendingConnection.set(null);
  log('Pending connection cleared from state');
  
  const targetDot = (event.target as Element).closest('.connection-dot');
  if (!targetDot) {
    log('handleConnectionEnd - No target dot found on release');
    return; 
  }
  
  const targetCardIdStr = targetDot.getAttribute('data-card-id');
  const targetSideStr = targetDot.getAttribute('data-side');

  if (!targetCardIdStr || !targetSideStr) {
    error('handleConnectionEnd - Missing data attributes on target dot', {targetCardIdStr, targetSideStr});
    return;
  }
  const targetCardId = parseInt(targetCardIdStr, 10);
  const targetSide = parseInt(targetSideStr, 10);
  
  if (isNaN(targetCardId) || isNaN(targetSide)) {
    error('handleConnectionEnd - Invalid target connection data (NaN)', { targetCardId, targetSide });
    return;
  }
  log('Connection end target data', { targetCardId, targetSide });
  
  if (targetCardId === pending.fromCardId) {
    log('handleConnectionEnd - Attempted to connect card to itself. Aborted.');
    return;
  }
  
  log('Creating final connection in state', { from: pending.fromCardId, to: targetCardId });
  createConnection({
    fromCardId: pending.fromCardId,
    fromSide: pending.fromSide,
    fromPosition: 0.5,
    toCardId: targetCardId,
    toSide: targetSide,
    toPosition: 0.5 
  });
}