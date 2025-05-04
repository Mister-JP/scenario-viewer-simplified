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
    if (!workspace) return;
    
    // Listen for connection initiation (clicking on dots)
    workspace.addEventListener('pointerdown', handlePossibleConnectionStart);
    
    // Track mouse movement during connection drawing
    document.addEventListener('pointermove', handleConnectionDragMove);
    
    // Finalize or cancel connection drawing
    document.addEventListener('pointerup', handleConnectionEnd);
  }
  
  /**
   * Detects when user starts drawing a connection from a card dot.
   * Product Flow: User clicks on a dot → connection drawing begins
   */
  // src/interactions/connections.ts - in handlePossibleConnectionStart()
function handlePossibleConnectionStart(event: PointerEvent) {
    log('handlePossibleConnectionStart - Entry', {
      target: event.target,
      targetClass: (event.target as Element)?.className,
      eventType: event.type,
      timestamp: Date.now()
    });
    
    const dot = (event.target as Element).closest('.connection-dot');
    
    log('Connection dot detection', {
      dotElement: !!dot,
      dotClass: dot?.className,
      dotAttributes: dot ? Object.fromEntries([...dot.attributes].map(a => [a.name, a.value])) : null
    });
    
    if (!dot) {
      log('handlePossibleConnectionStart - Early exit: No dot found', { 
        target: event.target 
      });
      return;
    }
    
    const cardId = parseInt(dot.getAttribute('data-card-id') || '', 10);
    const side = parseInt(dot.getAttribute('data-side') || '', 10);
    
    log('Connection data extracted', {
      cardId: cardId,
      side: side,
      isValid: !isNaN(cardId) && !isNaN(side)
    });
    
    if (isNaN(cardId) || isNaN(side)) {
      error('handlePossibleConnectionStart - Invalid connection data', { 
        cardId, 
        side,
        dotAttributes: [...dot.attributes].map(a => `${a.name}="${a.value}"`)
      });
      return;
    }
    
    const pendingState = {
      fromCardId: cardId,
      fromSide: side,
      currentX: event.clientX,
      currentY: event.clientY
    };
    
    log('Setting pending connection state', {
      oldState: $pendingConnection.get(),
      newState: pendingState
    });
    
    $pendingConnection.set(pendingState);
    
    log('Pending connection state set', {
      currentValue: $pendingConnection.get(),
      stateMatches: JSON.stringify($pendingConnection.get()) === JSON.stringify(pendingState)
    });
    
    event.preventDefault();
    log('Event prevented');
  }
  
  /**
   * Updates the preview connection line as user moves mouse.
   * Product Feedback: Shows real-time line from starting point to cursor.
   */
  function handleConnectionDragMove(event: PointerEvent) {
    const pending = $pendingConnection.get();
    if (!pending) return;
    
    // Update the end point of the preview line
    $pendingConnection.set({
      ...pending,
      currentX: event.clientX,
      currentY: event.clientY
    });
  }
  
  /**
   * Completes or cancels connection drawing when mouse released.
   * Product Logic: If released over another card's dot, create connection.
   * Otherwise, cancel the operation.
   */
  function handleConnectionEnd(event: PointerEvent) {
    const pending = $pendingConnection.get();
    if (!pending) return;
    
    // Clear pending state
    $pendingConnection.set(null);
    
    // Check if we're over a valid connection target
    const targetDot = (event.target as Element).closest('.connection-dot');
    if (!targetDot) return; // Not a valid target
    
    const targetCardId = parseInt(targetDot.getAttribute('data-card-id') || '', 10);
    const targetSide = parseInt(targetDot.getAttribute('data-side') || '', 10);
    
    if (isNaN(targetCardId) || isNaN(targetSide)) return;
    
    // Don't allow connections to the same card
    if (targetCardId === pending.fromCardId) return;
    
    // Create the new connection
    createConnection({
      fromCardId: pending.fromCardId,
      fromSide: pending.fromSide,
      fromPosition: 0.5,  // Center of edge
      toCardId: targetCardId,
      toSide: targetSide,
      toPosition: 0.5     // Center of edge
    });
  }