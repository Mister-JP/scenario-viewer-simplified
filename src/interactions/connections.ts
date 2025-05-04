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
  function handlePossibleConnectionStart(event: PointerEvent) {
    const dot = (event.target as Element).closest('.connection-dot');
    
    if (!dot) return; // Not clicking a connection dot
    
    const cardId = parseInt(dot.getAttribute('data-card-id') || '', 10);
    const side = parseInt(dot.getAttribute('data-side') || '', 10);
    
    if (isNaN(cardId) || isNaN(side)) return;
    
    // Start tracking a pending connection
    $pendingConnection.set({
      fromCardId: cardId,
      fromSide: side,
      currentX: event.clientX,
      currentY: event.clientY
    });
    
    event.preventDefault();
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